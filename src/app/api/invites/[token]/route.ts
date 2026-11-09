import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie, type Role } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/invites/[token] — valida y devuelve datos de la invitación
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const inv = await prisma.clientInvite.findUnique({ where: { token } });
  if (!inv) return NextResponse.json({ error: "no existe" }, { status: 404 });
  if (inv.revokedAt) return NextResponse.json({ error: "revocada" }, { status: 410 });
  if (inv.expiresAt < new Date()) return NextResponse.json({ error: "expirada" }, { status: 410 });
  if (inv.usedAt) return NextResponse.json({ error: "ya usada" }, { status: 409 });

  let client = null;
  if (inv.clientId) {
    client = await prisma.client.findUnique({
      where: { id: inv.clientId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
  }
  return NextResponse.json({
    firstName: inv.firstName ?? client?.firstName ?? null,
    lastName: inv.lastName ?? client?.lastName ?? null,
    email: inv.email ?? client?.email ?? null,
    hasClient: !!inv.clientId,
    hasUser: !!(client?.email),
  });
}

// POST /api/invites/[token]/accept    body: { password, email?, firstName?, lastName? }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();

  const inv = await prisma.clientInvite.findUnique({ where: { token } });
  if (!inv) return NextResponse.json({ error: "no existe" }, { status: 404 });
  if (inv.revokedAt) return NextResponse.json({ error: "revocada" }, { status: 410 });
  if (inv.expiresAt < new Date()) return NextResponse.json({ error: "expirada" }, { status: 410 });
  if (inv.usedAt) return NextResponse.json({ error: "ya usada" }, { status: 409 });

  const password = String(body.password ?? "");
  if (password.length < 6) {
    return NextResponse.json({ error: "Contraseña mínimo 6 caracteres" }, { status: 400 });
  }

  const email = String(body.email ?? inv.email ?? "").toLowerCase().trim();
  const firstName = String(body.firstName ?? inv.firstName ?? "").trim();
  const lastName = String(body.lastName ?? inv.lastName ?? "").trim();
  if (!email || !firstName) {
    return NextResponse.json({ error: "Email y nombre requeridos" }, { status: 400 });
  }

  // 1) Asegurar/crear Client
  let clientId = inv.clientId;
  if (!clientId) {
    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        phone: inv.phone ?? "",
        email,
      },
    });
    clientId = client.id;
  } else {
    // actualizar email en el client si no lo tenía
    await prisma.client.update({
      where: { id: clientId },
      data: { email: email, firstName, lastName },
    });
  }

  // 2) Crear/actualizar User vinculado
  const hash = await hashPassword(password);
  const existing = await prisma.user.findUnique({ where: { email } });
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash: hash,
          firstName,
          lastName,
          role: existing.role === "admin" || existing.role === "coach" ? existing.role : "member",
          clientId,
          isActive: true,
        },
      })
    : await prisma.user.create({
        data: {
          email,
          passwordHash: hash,
          firstName,
          lastName,
          role: "member",
          clientId,
        },
      });

  // 3) Marcar invite como usada
  await prisma.clientInvite.update({
    where: { token },
    data: { usedAt: new Date(), acceptedBy: user.id },
  });

  // 4) Iniciar sesión automáticamente
  await setSessionCookie({ userId: user.id, role: user.role as Role, email: user.email });

  return NextResponse.json({ success: true, role: user.role });
}

// DELETE /api/invites/[token] — revocar
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  await prisma.clientInvite.update({
    where: { token },
    data: { revokedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
