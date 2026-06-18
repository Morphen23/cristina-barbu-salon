import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createSessionToken,
  isAdminAuthenticated,
  isAdminAuthConfigured,
  sessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function GET() {
  return NextResponse.json({
    authenticated: await isAdminAuthenticated(),
    configured: isAdminAuthConfigured(),
  });
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: "Autentificarea nu este configurată pe server." },
      { status: 503 },
    );
  }

  const body = await request.json();
  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json(
      { error: "Utilizator sau parolă incorectă." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
