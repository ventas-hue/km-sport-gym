import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export const runtime = "nodejs";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function daysAgo(n: number) {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
}

export async function GET() {
  const user = await getUserFromSession();
  if (!user || !user.clientId) {
    return NextResponse.json({ error: "no client linked" }, { status: 401 });
  }
  const clientId = user.clientId;
  const now = new Date();
  const today = startOfDay(now);
  const weekStart = daysAgo(now.getDay()); // Dom como inicio

  const [
    activeMembership,
    todayWellness,
    latestWeight,
    activeWorkout,
    thisWeekSessions,
    todaySessions,
    activeNutrition,
    unreadMessages,
    last30Attendances,
    pendingCheckin,
  ] = await Promise.all([
    prisma.membership.findFirst({
      where: { clientId, endDate: { gte: now } },
      include: { package: true },
      orderBy: { endDate: "desc" },
    }),
    prisma.wellnessLog.findUnique({
      where: { clientId_date: { clientId, date: today } },
    }),
    prisma.bodyMeasurement.findFirst({
      where: { clientId, weight: { not: null } },
      orderBy: { date: "desc" },
    }),
    prisma.workout.findFirst({
      where: { clientId, isActive: true },
      orderBy: { updatedAt: "desc" },
      include: {
        days: {
          orderBy: { dayNumber: "asc" },
          include: {
            exercises: {
              orderBy: { order: "asc" },
              include: { exercise: { select: { name: true, muscleGroup: true } } },
            },
          },
        },
      },
    }),
    prisma.workoutSession.count({
      where: { clientId, date: { gte: weekStart } },
    }),
    prisma.workoutSession.findMany({
      where: { clientId, date: { gte: today } },
      orderBy: { date: "desc" },
    }),
    prisma.nutritionPlan.findFirst({
      where: { clientId, isActive: true },
      orderBy: { createdAt: "desc" },
      include: { meals: { orderBy: { order: "asc" }, include: { foods: true } } },
    }),
    prisma.message.count({
      where: { recipientId: user.id, readAt: null },
    }),
    prisma.attendance.findMany({
      where: { clientId, checkedAt: { gte: daysAgo(30) } },
      orderBy: { checkedAt: "desc" },
      select: { checkedAt: true },
    }),
    prisma.checkIn.findFirst({
      where: { clientId, weekStartDate: { gte: daysAgo(7) } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Calcular racha de días consecutivos con actividad (asistencia o sesión)
  const activityDays = new Set<string>();
  for (const a of last30Attendances) {
    activityDays.add(startOfDay(new Date(a.checkedAt)).toISOString());
  }
  // Streak partiendo desde hoy hacia atrás
  let streak = 0;
  const cursor = startOfDay(now);
  for (let i = 0; i < 30; i++) {
    const key = cursor.toISOString();
    if (activityDays.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      // permitir que hoy aún no tenga check-in sin romper la racha de ayer
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Día de rutina sugerido: día (dayOfWeek % totalDays) o el siguiente no completado hoy
  let todayWorkoutDay = null;
  if (activeWorkout && activeWorkout.days.length > 0) {
    const idx = (now.getDay() - 1 + activeWorkout.days.length) % activeWorkout.days.length;
    todayWorkoutDay = activeWorkout.days[idx];
  }

  return NextResponse.json({
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
    membership: activeMembership
      ? {
          packageName: activeMembership.package.name,
          endDate: activeMembership.endDate,
          daysLeft: Math.ceil(
            (new Date(activeMembership.endDate).getTime() - now.getTime()) /
              (24 * 60 * 60 * 1000)
          ),
        }
      : null,
    streak,
    today: {
      waterLiters: todayWellness?.waterLiters ?? 0,
      sleepHours: todayWellness?.sleepHours ?? null,
      mood: todayWellness?.mood ?? null,
      sessionsCompleted: todaySessions.filter((s) => s.completed).length,
      sessionsLogged: todaySessions.length,
    },
    week: {
      sessions: thisWeekSessions,
    },
    latestWeight: latestWeight
      ? { value: latestWeight.weight, date: latestWeight.date }
      : null,
    workoutToday: todayWorkoutDay
      ? {
          workoutId: activeWorkout!.id,
          dayId: todayWorkoutDay.id,
          dayName: todayWorkoutDay.name,
          dayNumber: todayWorkoutDay.dayNumber,
          exerciseCount: todayWorkoutDay.exercises.length,
          exercises: todayWorkoutDay.exercises.slice(0, 4).map((e) => ({
            name: e.exercise.name,
            sets: e.sets,
            reps: e.reps,
            muscleGroup: e.exercise.muscleGroup,
          })),
        }
      : null,
    nutrition: activeNutrition
      ? {
          name: activeNutrition.name,
          caloriesTarget: activeNutrition.caloriesTarget,
          mealsCount: activeNutrition.meals.length,
          meals: activeNutrition.meals.slice(0, 4).map((m) => ({
            name: m.name,
            timeOfDay: m.timeOfDay,
            foodsCount: m.foods.length,
          })),
        }
      : null,
    unreadMessages,
    pendingCheckin:
      !pendingCheckin || pendingCheckin.weekStartDate < daysAgo(7) ? true : false,
  });
}
