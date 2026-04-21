import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch (e) {
    return e as Response;
  }

  const clientId = request.nextUrl.searchParams.get("clientId");
  const onlyTemplates = request.nextUrl.searchParams.get("templates") === "1";

  const where =
    session.role === "admin" || session.role === "coach"
      ? {
          ...(clientId ? { clientId } : {}),
          ...(onlyTemplates ? { isTemplate: true } : {}),
        }
      : {
          // member: only their own workouts
          client: { user: { id: session.userId } },
        };

  const workouts = await prisma.workout.findMany({
    where,
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      coach: { select: { id: true, firstName: true, lastName: true } },
      days: {
        orderBy: { dayNumber: "asc" },
        include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(workouts);
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }

  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const workout = await prisma.workout.create({
    data: {
      name: body.name,
      description: body.description || null,
      coachId: session.userId,
      clientId: body.clientId || null,
      isTemplate: !body.clientId,
      days: body.days
        ? {
            create: body.days.map((d: { name: string; dayNumber?: number; notes?: string; exercises?: Array<{ exerciseId: string; sets?: number; reps?: string; restSeconds?: number; notes?: string; weight?: number; order?: number }> }, di: number) => ({
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
            })),
          }
        : undefined,
    },
    include: {
      days: { include: { exercises: { include: { exercise: true } } } },
    },
  });
  return NextResponse.json(workout, { status: 201 });
}
