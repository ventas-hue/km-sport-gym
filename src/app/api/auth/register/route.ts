import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, firstName, lastName, phone } = body ?? {};

  if (!email || !password || !firstName || !lastName || !phone) {
    return NextResponse.json(
      { error: "Todos los campos son requeridos" },
      { status: 400 }
    );
  }

  if (String(password).length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese email" },
      { status: 409 }
    );
  }

  // Create Client + User linked
  const user = await prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        firstName,
        lastName,
        phone,
        email: normalizedEmail,
      },
    });

    return tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
        firstName,
        lastName,
        phone,
        role: "member",
        clientId: client.id,
      },
    });
  });

  await setSessionCookie({
    userId: user.id,
    role: "member",
    email: user.email,
  });

  return NextResponse.json({ success: true, role: "member" });
}
