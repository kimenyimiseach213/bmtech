import { NextRequest, NextResponse } from "next/server";

const sessionCookie = "bmtech_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const plainAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (plainAdmin) {
    const target = request.nextUrl.clone();
    target.pathname = pathname.replace(/^\/admin/, "/en/admin");
    return NextResponse.redirect(target);
  }

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];
  const hasLocale = locale === "en" || locale === "fr";
  if (!hasLocale) {
    if (segments[1] === "admin") {
      const target = request.nextUrl.clone();
      const requestedPath = `/en/admin/${segments.slice(2).join("/")}`.replace(/\/$/, "");
      target.pathname = "/en/admin/login";
      target.search = `?next=${encodeURIComponent(requestedPath)}`;
      return NextResponse.redirect(target);
    }
    const savedLocale = request.cookies.get("bmtech_locale")?.value;
    const targetLocale = savedLocale === "fr" ? "fr" : "en";
    const target = request.nextUrl.clone();
    target.pathname = `/${targetLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(target);
  }

  if (segments[1] === "admin") {
    const isLogin = segments[2] === "login";
    const hasSession = Boolean(request.cookies.get(sessionCookie)?.value);
    if (segments.length === 2 && hasSession) {
      const target = request.nextUrl.clone();
      target.pathname = `/${locale}/admin/dashboard`;
      return NextResponse.redirect(target);
    }
    if (isLogin && hasSession) {
      const target = request.nextUrl.clone();
      target.pathname = `/${locale}/admin/dashboard`;
      return NextResponse.redirect(target);
    }
    if (!isLogin && !hasSession) {
      const target = request.nextUrl.clone();
      const next = `${pathname}${request.nextUrl.search}`;
      target.pathname = `/${locale}/admin/login`;
      target.search = `?next=${encodeURIComponent(next)}`;
      return NextResponse.redirect(target);
    }
    return NextResponse.next();
  }

  // Public pages use the existing route files internally while keeping /en or /fr in the URL.
  const destination = request.nextUrl.clone();
  destination.pathname = `/${segments.slice(1).join("/")}` || "/";
  if (destination.pathname === "" || destination.pathname === "/") destination.pathname = "/";
  const response = NextResponse.rewrite(destination);
  response.cookies.set("bmtech_locale", locale, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });
  return response;
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico).*)"],
};
