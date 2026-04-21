import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

async function resolveClientId(
  session: { userId: string; role: string },
  queryClientId: string | null
) {
  if (session.role === "member") {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    return user?.clientId ?? null;
  }
  return queryClientId;
}

export async function GET(request: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const clientId = await resolveClientId(
    session,
    request.nextUrl.searchParams.get("clientId")
  );
  if (!clientId) return NextResponse.json([]);
  const items = await prisma.wellnessLog.findMany({
    where: { clientId },
    orderBy: { date: "desc" },
    take: 60,
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const body = await request.json();
  const clientId = await resolveClientId(session, body.clientId ?? null);
  if (!clientId) return NextResponse.json({ error: "clientId requerido" }, { status: 400 });

  const date = body.date ? new Date(body.date) : new Date();
  date.setHours(0, 0, 0, 0);

  const log = await prisma.wellnessLog.upsert({
    where: { clientId_date: { clientId, date } },
    update: {
      sleepHours: num(body.sleepHours),
      waterLiters: num(body.waterLiters),
      steps: int(body.steps),
      mood: int(body.mood),
      energy: int(body.energy),
      stress: int(body.stress),
      notes: body.notes ?? null,
    },
    create: {
      clientId,
      date,
      sleepHours: num(body.sleepHours),
      waterLiters: num(body.waterLiters),
      steps: int(body.steps),
      mood: int(body.mood),
      energy: int(body.energy),
      stress: int(body.stress),
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(log, { status: 201 });
}

function num(v: unknown): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}
function int(v: unknown): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : parseInt(String(v));
  return Number.isFinite(n) ? Math.round(n) : null;
}
