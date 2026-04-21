import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

async function canAccess(workoutId: string, session: { userId: string; role: string }) {
  const w = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: { client: { include: { user: true } } },
  });
  if (!w) return { ok: false as const };
  if (session.role === "admin") return { ok: true as const, workout: w };
  if (session.role === "coach" && w.coachId === session.userId)
    return { ok: true as const, workout: w };
  if (session.role === "member" && w.client?.user?.id === session.userId)
    return { ok: true as const, workout: w };
  return { ok: false as const };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const res = await canAccess(id, session);
  if (!res.ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const workout = await prisma.workout.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      coach: { select: { id: true, firstName: true, lastName: true } },
      days: {
        orderBy: { dayNumber: "asc" },
        include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
      },
    },
  });
  return NextResponse.json(workout);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const res = await canAccess(id, session);
  if (!res.ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json();

  // Replace strategy: delete all days (cascades to exercises) and recreate
  const updated = await prisma.$transaction(async (tx) => {
    await tx.workoutDay.deleteMany({ where: { workoutId: id } });
    return tx.workout.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        isActive: body.isActive ?? true,
        clientId: body.clientId ?? null,
        isTemplate: !body.clientId,
        days: body.days
          ? {
              create: body.days.map(
                (
                  d: {
                    name: string;
                    dayNumber?: number;
                    notes?: string;
                    exercises?: Array<{
                      exerciseId: string;
                      sets?: number;
                      reps?: string;
                      restSeconds?: number;
                      weight?: number;
                      notes?: string;
                      order?: number;
                    }>;
                  },
                  di: number
                ) => ({
                  dayNumber: d.dayNumber ?? di + 1,
                  name: d.name,
                  notes: d.notes || null,
                  exercises: d.exercises
                    ? {
                        create: d.exercises.map((e, ei) => ({
                          exerciseId: e.exerciseId,
                          order: e.order ?? ei,
                          sets: e.sets ?? 3,
                          reps: e.reps ?? "10",
                          restSeconds: e.restSeconds ?? null,
                          weight: e.weight ?? null,
                          notes: e.notes || null,
                        })),
                      }
                    : undefined,
                })
              ),
            }
          : undefined,
      },
      include: {
        days: { include: { exercises: { include: { exercise: true } } } },
      },
    });
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const res = await canAccess(id, session);
  if (!res.ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  await prisma.workout.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
