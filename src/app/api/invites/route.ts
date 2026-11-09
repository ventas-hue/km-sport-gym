import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export const runtime = "nodejs";

function makeToken() {
  return randomBytes(18).toString("base64url");
}

// GET /api/invites — lista invitaciones
export async function GET() {
  let session;
  try {
    session = await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const where = session.role === "admin" ? {} : { createdBy: session.email };
  const invites = await prisma.clientInvite.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  // Resolver cliente si tiene
  const clientIds = invites
    .map((i) => i.clientId)
    .filter((v): v is string => !!v);
  const clients = clientIds.length
    ? await prisma.client.findMany({
        where: { id: { in: clientIds } },
        select: { id: true, firstName: true, lastName: true, phone: true },
      })
    : [];
  const byId = new Map(clients.map((c) => [c.id, c]));
  return NextResponse.json(
    invites.map((i) => ({
      ...i,
      client: i.clientId ? byId.get(i.clientId) ?? null : null,
    }))
  );
}

// POST /api/invites  { clientId?, email?, firstName?, lastName?, phone?, packageId?, expiresInDays? }
export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const body = await request.json();
  const days = Math.max(1, Math.min(60, Number(body.expiresInDays ?? 14)));

  if (!body.clientId && !body.email && !body.phone) {
    return NextResponse.json(
      { error: "Se requiere clientId, email o teléfono" },
      { status: 400 }
    );
  }

  const token = makeToken();
  const invite = await prisma.clientInvite.create({
    data: {
      token,
      clientId: body.clientId ?? null,
      email: body.email?.toLowerCase() ?? null,
      firstName: body.firstName ?? null,
      lastName: body.lastName ?? null,
      phone: body.phone ?? null,
      packageId: body.packageId ?? null,
      createdBy: session.email,
      expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    },
  });
  return NextResponse.json(invite);
}
