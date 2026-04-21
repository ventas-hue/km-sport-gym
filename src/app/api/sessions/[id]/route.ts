import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { estimate1RM } from "@/lib/fitness";

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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let sess;
  try {
    sess = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const ws = await canAccess(id, sess);
  if (!ws) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const detail = await prisma.workoutSession.findUnique({
    where: { id },
    include: {
      workout: { include: { days: { include: { exercises: { include: { exercise: true } } } } } },
      setLogs: { include: { exercise: true }, orderBy: [{ workoutExerciseId: "asc" }, { setNumber: "asc" }] },
    },
  });
  return NextResponse.json(detail);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const updated = await prisma.workoutSession.update({
    where: { id },
    data: {
      completed: body.completed ?? undefined,
      durationMin: body.durationMin ?? undefined,
      totalVolume: body.totalVolume ?? undefined,
      totalSets: body.totalSets ?? undefined,
      rating: body.rating ?? undefined,
      notes: body.notes ?? undefined,
    },
  });

  // If session marked completed, (re)compute personal records from its set logs
  if (body.completed) {
    const logs = await prisma.setLog.findMany({
      where: { sessionId: id },
      include: { exercise: true },
    });

    const perExercise = new Map<string, { max1RM: number; maxVolume: number; maxReps: number }>();
    for (const l of logs) {
      const est = estimate1RM(l.weight, l.reps);
      const vol = l.weight * l.reps;
      const current = perExercise.get(l.exerciseId) ?? {
        max1RM: 0,
        maxVolume: 0,
        maxReps: 0,
      };
      if (est > current.max1RM) current.max1RM = est;
      if (vol > current.maxVolume) current.maxVolume = vol;
      if (l.reps > current.maxReps) current.maxReps = l.reps;
      perExercise.set(l.exerciseId, current);
    }

    for (const [exerciseId, r] of perExercise) {
      await Promise.all([
        r.max1RM > 0
          ? prisma.personalRecord.upsert({
              where: {
                clientId_exerciseId_type: {
                  clientId: ws.clientId,
                  exerciseId,
                  type: "1RM",
                },
              },
              update: {
                value: Math.max(
                  r.max1RM,
                  (await prisma.personalRecord.findUnique({
                    where: {
                      clientId_exerciseId_type: {
                        clientId: ws.clientId,
                        exerciseId,
                        type: "1RM",
                      },
                    },
                  }))?.value ?? 0
                ),
              },
              create: {
                clientId: ws.clientId,
                exerciseId,
                type: "1RM",
                value: r.max1RM,
              },
            })
          : Promise.resolve(),
        r.maxVolume > 0
          ? prisma.personalRecord.upsert({
              where: {
                clientId_exerciseId_type: {
                  clientId: ws.clientId,
                  exerciseId,
                  type: "volume",
                },
              },
              update: {
                value: Math.max(
                  r.maxVolume,
                  (await prisma.personalRecord.findUnique({
                    where: {
                      clientId_exerciseId_type: {
                        clientId: ws.clientId,
                        exerciseId,
                        type: "volume",
                      },
                    },
                  }))?.value ?? 0
                ),
              },
              create: {
                clientId: ws.clientId,
                exerciseId,
                type: "volume",
                value: r.maxVolume,
              },
            })
          : Promise.resolve(),
      ]);
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let sess;
  try {
    sess = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const ws = await canAccess(id, sess);
  if (!ws) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  await prisma.workoutSession.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
