import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

async function resolveClientId(s: { userId: string; role: string }, q: string | null) {
  if (s.role === "member") {
    const u = await prisma.user.findUnique({ where: { id: s.userId } });
    return u?.clientId ?? null;
  }
  return q;
}

export async function GET(request: NextRequest) {
  let s;
  try {
    s = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const clientId = await resolveClientId(s, request.nextUrl.searchParams.get("clientId"));
  if (!clientId) return NextResponse.json([]);
  const plans = await prisma.nutritionPlan.findMany({
    where: { clientId },
    include: {
      meals: {
        include: { foods: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  let s;
  try {
    s = await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const body = await request.json();
  if (!body.clientId) return NextResponse.json({ error: "clientId requerido" }, { status: 400 });

  const plan = await prisma.nutritionPlan.create({
    data: {
      clientId: body.clientId,
      name: body.name,
      caloriesTarget: body.caloriesTarget ?? null,
      proteinG: body.proteinG ?? null,
      carbsG: body.carbsG ?? null,
      fatG: body.fatG ?? null,
      waterLiters: body.waterLiters ?? null,
      notes: body.notes ?? null,
      meals: body.meals
        ? {
            create: body.meals.map(
              (
                m: {
                  name: string;
                  timeOfDay?: string;
                  notes?: string;
                  foods?: Array<{
                    name: string;
                    grams?: number;
                    calories?: number;
                    proteinG?: number;
                    carbsG?: number;
                    fatG?: number;
                  }>;
                },
                mi: number
              ) => ({
                name: m.name,
                timeOfDay: m.timeOfDay ?? null,
                notes: m.notes ?? null,
                order: mi,
                foods: m.foods
                  ? {
                      create: m.foods.map((f) => ({
                        name: f.name,
                        grams: f.grams ?? null,
                        calories: f.calories ?? null,
                        proteinG: f.proteinG ?? null,
                        carbsG: f.carbsG ?? null,
                        fatG: f.fatG ?? null,
                      })),
                    }
                  : undefined,
              })
            ),
          }
        : undefined,
    },
    include: { meals: { include: { foods: true } } },
  });
  return NextResponse.json(plan, { status: 201 });
}
