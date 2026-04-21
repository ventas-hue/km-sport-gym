import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

async function canAccess(id: string, s: { userId: string; role: string }) {
  const g = await prisma.goal.findUnique({
    where: { id },
    include: { client: { include: { user: true } } },
  });
  if (!g) return null;
  if (s.role === "admin" || s.role === "coach") return g;
  if (s.role === "member" && g.client.user?.id === s.userId) return g;
  return null;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let s;
  try {
    s = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const g = await canAccess(id, s);
  if (!g) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json();
  const updated = await prisma.goal.update({
    where: { id },
    data: {
      currentValue: body.currentValue !== undefined ? body.currentValue : undefined,
      targetValue: body.targetValue !== undefined ? body.targetValue : undefined,
      status: body.status ?? undefined,
      deadline: body.deadline !== undefined ? (body.deadline ? new Date(body.deadline) : null) : undefined,
      title: body.title ?? undefined,
      description: body.description ?? undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let s;
  try {
    s = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const g = await canAccess(id, s);
  if (!g) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
