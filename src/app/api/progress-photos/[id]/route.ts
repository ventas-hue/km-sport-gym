import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function DELETE(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let s;
  try {
    s = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const p = await prisma.progressPhoto.findUnique({
    where: { id },
    include: { client: { include: { user: true } } },
  });
  if (!p) return NextResponse.json({ error: "No existe" }, { status: 404 });
  if (s.role !== "admin" && s.role !== "coach" && p.client.user?.id !== s.userId)
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  await prisma.progressPhoto.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
