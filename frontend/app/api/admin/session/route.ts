import { NextResponse } from "next/server";

function clearCookie(name: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=0`;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.headers.append("set-cookie", clearCookie("bmtech_admin_session"));
  response.headers.append("set-cookie", clearCookie("bmtech_admin_token"));
  return response;
}
