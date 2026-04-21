import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

async function canAccess(id: string, s: { userId: string; role: string }) {
  const sup = await prisma.supplement.findUnique({
    where: { id },
    include: { client: { include: { user: true } } },
  });
  if (!sup) return null;
  if (s.role === "admin" || s.role === "coach") return sup;
  if (s.role === "member" && sup.client.user?.id === s.userId) return sup;
  return null;
}

export async function DELETE(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let s;
  try {
    s = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const sup = await canAccess(id, s);
  if (!sup) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  await prisma.supplement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
