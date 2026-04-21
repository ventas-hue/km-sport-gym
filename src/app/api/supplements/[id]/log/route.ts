import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let s;
  try {
    s = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const sup = await prisma.supplement.findUnique({
    where: { id },
    include: { client: { include: { user: true } } },
  });
  if (!sup) return NextResponse.json({ error: "No existe" }, { status: 404 });
  if (s.role === "member" && sup.client.user?.id !== s.userId)
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json();
  const date = body.date ? new Date(body.date) : new Date();
  date.setHours(0, 0, 0, 0);
  const taken = body.taken !== false;

  const log = await prisma.supplementLog.upsert({
    where: { supplementId_date: { supplementId: id, date } },
    update: { taken },
    create: { supplementId: id, date, taken },
  });
  return NextResponse.json(log);
}
