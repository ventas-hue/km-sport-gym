import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

async function canAccess(mId: string, s: { userId: string; role: string }) {
  const m = await prisma.bodyMeasurement.findUnique({
    where: { id: mId },
    include: { client: { include: { user: true } } },
  });
  if (!m) return null;
  if (s.role === "admin" || s.role === "coach") return m;
  if (s.role === "member" && m.client?.user?.id === s.userId) return m;
  return null;
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let s;
  try {
    s = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const m = await canAccess(id, s);
  if (!m) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  await prisma.bodyMeasurement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
