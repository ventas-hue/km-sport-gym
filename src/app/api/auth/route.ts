import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  clearSessionCookie,
  hashPassword,
  setSessionCookie,
  verifyPassword,
  type Role,
} from "@/lib/auth";

const LEGACY_USER = process.env.ADMIN_USER ?? "admin";
const LEGACY_PASS = process.env.ADMIN_PASS ?? "lm2024";
const LEGACY_EMAIL =
  process.env.ADMIN_EMAIL ?? "admin@lmsportgym.com";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, username, password } = body ?? {};

  // Legacy admin path: accept old { username, password } env-based login
  if (username && password && username === LEGACY_USER && password === LEGACY_PASS) {
    const user = await prisma.user.upsert({
      where: { email: LEGACY_EMAIL },
      update: {},
      create: {
        email: LEGACY_EMAIL,
        passwordHash: await hashPassword(LEGACY_PASS),
        firstName: "Karla Lizeth",
        lastName: "Merlos",
        role: "admin",
      },
    });
    await setSessionCookie({ userId: user.id, role: user.role as Role, email: user.email });
    return NextResponse.json({ success: true, role: user.role });
  }

  // DB-backed login via email
  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  await setSessionCookie({ userId: user.id, role: user.role as Role, email: user.email });
  return NextResponse.json({ success: true, role: user.role });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
