import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "lm2024";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.username === ADMIN_USER && body.password === ADMIN_PASS) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("lm_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("lm_session");
  return response;
}
