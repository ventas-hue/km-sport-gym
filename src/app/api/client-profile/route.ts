import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getUserFromSession } from "@/lib/auth";

async function resolveClientId(requestedId: string | null): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;

  // Admin or coach can request any client's profile via ?clientId=...
  if (session.role !== "member" && requestedId) return requestedId;

  // Member or self: resolve from the user's linked client
  const user = await getUserFromSession();
  return user?.clientId ?? null;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const requested = request.nextUrl.searchParams.get("clientId");
  const clientId = await resolveClientId(requested);
  if (!clientId) {
    return NextResponse.json({ error: "no client linked" }, { status: 404 });
  }

  const profile = await prisma.clientProfile.findUnique({
    where: { clientId },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          birthDate: true,
        },
      },
    },
  });

  return NextResponse.json({ profile, clientId });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const requested = session.role !== "member" ? body.clientId ?? null : null;
  const clientId = await resolveClientId(requested);
  if (!clientId) {
    return NextResponse.json({ error: "no client linked" }, { status: 404 });
  }

  const data = {
    gender: body.gender ?? null,
    age: body.age ? Number(body.age) : null,
    heightCm: body.heightCm ? Number(body.heightCm) : null,
    initialWeight: body.initialWeight ? Number(body.initialWeight) : null,
    mainGoal: body.mainGoal ?? null,
    secondaryGoal: body.secondaryGoal ?? null,
    targetWeight: body.targetWeight ? Number(body.targetWeight) : null,
    experienceLevel: body.experienceLevel ?? null,
    trainingYears: body.trainingYears ? Number(body.trainingYears) : null,
    activityLevel: body.activityLevel ?? null,
    daysPerWeek: body.daysPerWeek ? Number(body.daysPerWeek) : null,
    minutesPerSession: body.minutesPerSession ? Number(body.minutesPerSession) : null,
    preferredTime: body.preferredTime ?? null,
    trainsAt: body.trainsAt ?? null,
    equipmentAvailable: body.equipmentAvailable ?? null,
    injuries: body.injuries ?? null,
    medicalConditions: body.medicalConditions ?? null,
    medications: body.medications ?? null,
    pregnantOrBreastfeed:
      typeof body.pregnantOrBreastfeed === "boolean"
        ? body.pregnantOrBreastfeed
        : null,
    smokes: typeof body.smokes === "boolean" ? body.smokes : null,
    alcoholFreq: body.alcoholFreq ?? null,
    diet: body.diet ?? null,
    allergies: body.allergies ?? null,
    intolerances: body.intolerances ?? null,
    foodsDisliked: body.foodsDisliked ?? null,
    foodsPreferred: body.foodsPreferred ?? null,
    mealsPerDay: body.mealsPerDay ? Number(body.mealsPerDay) : null,
    waterLitersPerDay: body.waterLitersPerDay ? Number(body.waterLitersPerDay) : null,
    budgetPerWeek: body.budgetPerWeek ? Number(body.budgetPerWeek) : null,
    cookingSkill: body.cookingSkill ?? null,
    sleepHours: body.sleepHours ? Number(body.sleepHours) : null,
    stressLevel: body.stressLevel ? Number(body.stressLevel) : null,
    jobActivity: body.jobActivity ?? null,
    currentSupplements: body.currentSupplements ?? null,
    notes: body.notes ?? null,
  };

  const profile = await prisma.clientProfile.upsert({
    where: { clientId },
    update: data,
    create: { clientId, ...data },
  });

  return NextResponse.json({ profile });
}
