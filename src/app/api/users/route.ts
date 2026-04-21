import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireSession(["admin"]);
  } catch (e) {
    return e as Response;
  }
  const role = request.nextUrl.searchParams.get("role");
  const search = request.nextUrl.searchParams.get("search") ?? "";

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      avatarUrl: true,
    },
    orderBy: [{ role: "asc" }, { firstName: "asc" }],
  });
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  try {
    await requireSession(["admin"]);
  } catch (e) {
    return e as Response;
  }

  const body = await request.json();
  const { email, password, firstName, lastName, phone, role } = body ?? {};

  if (!email || !password || !firstName || !lastName || !role) {
    return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 });
  }
  if (!["admin", "coach", "member"].includes(role)) {
    return NextResponse.json({ error: "Rol invalido" }, { status: 400 });
  }
  if (String(password).length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 }
    );
  }

  const normalized = String(email).toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese email" },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: {
      email: normalized,
      passwordHash: await hashPassword(password),
      firstName,
      lastName,
      phone: phone ?? null,
      role,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  return NextResponse.json(user, { status: 201 });
}
