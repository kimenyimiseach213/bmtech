import { NextRequest } from "next/server";
export const runtime = "nodejs";
/** Public media only: no credentials, arbitrary hosts, or filesystem paths from callers. */
export async function GET(_request: NextRequest, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;
  if (!/^[a-zA-Z0-9_-]+\.(?:jpe?g|png|webp|gif)$/i.test(file)) return new Response("Image not found", { status: 404 });
  try {
    const origin = new URL(process.env.BMTECH_API_BASE_URL || "");
    if (!["https:", "http:"].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== "/") throw new Error("Invalid API origin");
    const response = await fetch(new URL(`/uploads/${encodeURIComponent(file)}`, origin), { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) return new Response("Image unavailable", { status: response.status === 404 ? 404 : 502 });
    const type = response.headers.get("content-type")?.split(";")[0] || "";
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(type)) return new Response("Invalid image response", { status: 502 });
    return new Response(response.body, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response("Image service unavailable", { status: 503 }); }
}
