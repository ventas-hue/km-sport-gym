import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

// GET /api/attendance?from=YYYY-MM-DD&to=YYYY-MM-DD&clientId=
export async function GET(request: NextRequest) {
  try {
    await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const p = request.nextUrl.searchParams;
  const from = p.get("from");
  const to = p.get("to");
  const clientId = p.get("clientId");

  const where: Record<string, unknown> = {};
  if (clientId) where.clientId = clientId;
  if (from || to) {
    const date: Record<string, Date> = {};
    if (from) date.gte = new Date(from);
    if (to) date.lte = new Date(to + "T23:59:59");
    where.checkedAt = date;
  }

  const rows = await prisma.attendance.findMany({
    where,
    include: { client: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { checkedAt: "desc" },
    take: 500,
  });
  return NextResponse.json(rows);
}

// POST /api/attendance  { clientId?, qrToken? }
export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const body = await request.json().catch(() => ({}));
  let clientId: string | null = body.clientId ?? null;

  if (!clientId && body.qrToken) {
    const c = await prisma.client.findUnique({
      where: { qrToken: body.qrToken },
      select: { id: true },
    });
    clientId = c?.id ?? null;
  }
  if (!clientId) {
    return NextResponse.json({ error: "clientId o qrToken requerido" }, { status: 400 });
  }

  // Un registro cada 4h para evitar duplicados por escaneo múltiple
  const since = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const recent = await prisma.attendance.findFirst({
    where: { clientId, checkedAt: { gte: since } },
    orderBy: { checkedAt: "desc" },
  });
  if (recent) {
    return NextResponse.json({ ok: true, duplicated: true, attendance: recent });
  }

  const attendance = await prisma.attendance.create({
    data: {
      clientId,
      method: body.qrToken ? "qr" : "manual",
      source: session.email,
      notes: body.notes ?? null,
    },
    include: { client: { select: { id: true, firstName: true, lastName: true } } },
  });
  return NextResponse.json({ ok: true, attendance });
}
