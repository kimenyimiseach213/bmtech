import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SESSION_COOKIE = "bmtech_admin_session";
const TOKEN_COOKIE = "bmtech_admin_token";

function cookieOptions(name: string, value: string, maxAge?: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const age = maxAge === undefined ? "" : `; Max-Age=${maxAge}`;
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax${secure}${age}`;
}

function readCookie(header: string, name: string) {
  const pair = header.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : "";
}

function cleanBackendCookie(value: string) {
  let cookie = value
    .replace(/;\s*Domain=[^;]*/ig, "")
    .replace(/;\s*Path=[^;]*/ig, "; Path=/");
  if (!/;\s*Path=/i.test(cookie)) cookie += "; Path=/";
  if (!/;\s*HttpOnly/i.test(cookie)) cookie += "; HttpOnly";
  if (!/;\s*SameSite=/i.test(cookie)) cookie += "; SameSite=Lax";
  if (process.env.NODE_ENV === "production" && !/;\s*Secure/i.test(cookie)) cookie += "; Secure";
  return cookie;
}

function extractAccessToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const row = payload as Record<string, unknown>;
  const nested = row.data && typeof row.data === "object" ? row.data as Record<string, unknown> : {};
  const candidate = row.accessToken ?? row.access_token ?? row.token ?? nested.accessToken ?? nested.access_token ?? nested.token;
  return typeof candidate === "string" && candidate.length > 0 ? candidate : null;
}

function removeTokens(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removeTokens);
  if (!value || typeof value !== "object") return value;
  const filtered: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (["accessToken", "access_token", "refreshToken", "refresh_token", "token"].includes(key)) continue;
    filtered[key] = removeTokens(child);
  }
  return filtered;
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const baseUrl = process.env.BMTECH_API_BASE_URL?.trim();
  if (!baseUrl) return Response.json({ message: "BMTECH_API_BASE_URL is not configured." }, { status: 503 });

  let backendOrigin: URL;
  try {
    backendOrigin = new URL(baseUrl);
    if (!["http:", "https:"].includes(backendOrigin.protocol) || backendOrigin.username || backendOrigin.password) throw new Error("Invalid API origin");
    if (backendOrigin.pathname !== "/" || backendOrigin.search || backendOrigin.hash) throw new Error("API base must be an origin without /api/v1");
  } catch {
    console.error("[BMTECH API proxy] BMTECH_API_BASE_URL must be an HTTP(S) origin without a path, query, credentials, or fragment.");
    return Response.json({ message: "The server is temporarily unavailable. Please try again." }, { status: 503 });
  }

  const { path } = await context.params;
  if (!path.length || path.some((part) => part === "." || part === ".." || part.includes("\\") || part.includes("/"))) {
    return Response.json({ message: "Invalid API path." }, { status: 400 });
  }
  const pathValue = path.map((part) => encodeURIComponent(part)).join("/");
  if (!pathValue.startsWith("api/v1/")) return Response.json({ message: "Only /api/v1 endpoints are available." }, { status: 404 });

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(`${pathValue}${request.nextUrl.search}`, backendOrigin.href.endsWith("/") ? backendOrigin : `${backendOrigin.href}/`);
    if (!["http:", "https:"].includes(upstreamUrl.protocol)) throw new Error("Unsupported protocol");
  } catch {
    return Response.json({ message: "BMTECH_API_BASE_URL must be a valid HTTP(S) URL." }, { status: 500 });
  }

  const incomingCookie = request.headers.get("cookie") ?? "";
  const isLogin = pathValue === "api/v1/admin/auth/login";
  const isLogout = pathValue === "api/v1/admin/auth/logout";
  const isEmailVerification = pathValue === "api/v1/admin/auth/email-change/verify";
  const isPasswordChange = pathValue === "api/v1/admin/auth/change-password";
  const isAccountMutation = isPasswordChange || isEmailVerification || pathValue === "api/v1/admin/auth/email-change/request";
  if (isAccountMutation && !["GET", "HEAD"].includes(request.method) && request.headers.get("origin") !== request.nextUrl.origin) {
    return Response.json({ message: "This account request must come from the BMTECH website." }, { status: 403 });
  }
  if (pathValue.startsWith("api/v1/admin/") && !isLogin && !isLogout && !isEmailVerification && !readCookie(incomingCookie, SESSION_COOKIE)) {
    return Response.json({ message: "Administrator authentication is required." }, { status: 401 });
  }
  const accessToken = readCookie(incomingCookie, TOKEN_COOKIE);
  const forwardedCookies = incomingCookie.split(";").map((entry) => entry.trim())
    .filter((entry) => entry && !entry.startsWith(`${SESSION_COOKIE}=`) && !entry.startsWith(`${TOKEN_COOKIE}=`))
    .join("; ");
  const headers = new Headers();
  for (const header of ["accept", "content-type", "if-none-match", "if-modified-since"]) {
    const value = request.headers.get(header);
    if (value) headers.set(header, value);
  }
  if (forwardedCookies) headers.set("cookie", forwardedCookies);
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

  let upstream: Response;
  try {
    const hasBody = !["GET", "HEAD"].includes(request.method);
    upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
    });
  } catch (error) {
    // Log only a safe transport code and hostname, never request bodies, tokens,
    // full URLs, or raw exceptions (which can include credentials).
    const cause = error instanceof Error ? error.cause : undefined;
    const code = cause && typeof cause === "object" && "code" in cause ? cause.code : undefined;
    console.error("[BMTECH API proxy] Upstream connection failed", {
      host: backendOrigin.hostname,
      code: typeof code === "string" && /^[A-Z0-9_]{1,40}$/.test(code) ? code : "UNKNOWN",
    });
    return Response.json({ message: "The server is temporarily unavailable. Please try again." }, { status: 502 });
  }

  const responseHeaders = new Headers({
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  for (const header of ["content-type", "content-disposition", "etag", "last-modified"]) {
    const value = upstream.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }

  const getSetCookie = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const backendCookies = getSetCookie ? getSetCookie.call(upstream.headers) : (upstream.headers.get("set-cookie") ? [upstream.headers.get("set-cookie")!] : []);
  for (const cookie of backendCookies) responseHeaders.append("set-cookie", cleanBackendCookie(cookie));

  let accessTokenFromBody: string | null = null;
  let responseBody: BodyInit | null = upstream.body;
  if (isLogin && upstream.ok) {
    try { accessTokenFromBody = extractAccessToken(await upstream.clone().json()); } catch { /* Invalid authentication response. */ }
    // NestJS login must return a JWT. An HTML page or empty 2xx response from
    // a misconfigured upstream must never establish an administrator session.
    if (!accessTokenFromBody) {
      console.error("[BMTECH API proxy] Login response did not contain an access token.");
      return Response.json({ message: "An unexpected server error occurred." }, { status: 502 });
    }
    responseHeaders.append("set-cookie", cookieOptions(SESSION_COOKIE, "1", 60 * 60 * 12));
    if (accessTokenFromBody) responseHeaders.append("set-cookie", cookieOptions(TOKEN_COOKIE, accessTokenFromBody, 60 * 60 * 12));
    if (accessTokenFromBody) {
      try {
        responseBody = JSON.stringify(removeTokens(await upstream.clone().json()));
        responseHeaders.set("content-type", "application/json; charset=utf-8");
      } catch { /* Keep a non-JSON login response unchanged. */ }
    }
  }
  if (isLogout || ((isPasswordChange || isEmailVerification) && upstream.ok) || (pathValue.startsWith("api/v1/admin/") && upstream.status === 401)) {
    responseHeaders.append("set-cookie", cookieOptions(SESSION_COOKIE, "", 0));
    responseHeaders.append("set-cookie", cookieOptions(TOKEN_COOKIE, "", 0));
  }

  return new Response(responseBody, { status: upstream.status, headers: responseHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
