import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

async function canAccess(sessionId: string, s: { userId: string; role: string }) {
  const ws = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: { client: { include: { user: true } } },
  });
  if (!ws) return null;
  if (s.role === "admin" || s.role === "coach") return ws;
  if (s.role === "member" && ws.client?.user?.id === s.userId) return ws;
  return null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let sess;
  try {
    sess = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const ws = await canAccess(id, sess);
  if (!ws) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json();
  const log = await prisma.setLog.create({
    data: {
      sessionId: id,
      workoutExerciseId: body.workoutExerciseId ?? null,
      exerciseId: body.exerciseId,
      setNumber: body.setNumber,
      reps: body.reps,
      weight: body.weight,
      rpe: body.rpe ?? null,
    },
    include: { exercise: true },
  });
  return NextResponse.json(log, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let sess;
  try {
    sess = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const ws = await canAccess(id, sess);
  if (!ws) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const setId = request.nextUrl.searchParams.get("setId");
  if (!setId) return NextResponse.json({ error: "setId requerido" }, { status: 400 });

  await prisma.setLog.delete({ where: { id: setId } });
  return NextResponse.json({ success: true });
}
