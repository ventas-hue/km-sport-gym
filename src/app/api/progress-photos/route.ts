import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

async function resolveClientId(session: { userId: string; role: string }, q: string | null) {
  if (session.role === "member") {
    const u = await prisma.user.findUnique({ where: { id: session.userId } });
    return u?.clientId ?? null;
  }
  return q;
}

export async function GET(request: NextRequest) {
  let s;
  try {
    s = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const clientId = await resolveClientId(s, request.nextUrl.searchParams.get("clientId"));
  if (!clientId) return NextResponse.json([]);
  const items = await prisma.progressPhoto.findMany({
    where: { clientId },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  let s;
  try {
    s = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const body = await request.json();
  const clientId = await resolveClientId(s, body.clientId ?? null);
  if (!clientId) return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  if (!body.url || !body.type) return NextResponse.json({ error: "url y type requeridos" }, { status: 400 });

  const created = await prisma.progressPhoto.create({
    data: {
      clientId,
      date: body.date ? new Date(body.date) : new Date(),
      type: body.type,
      url: body.url,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
