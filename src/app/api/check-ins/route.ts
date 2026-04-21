import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

function weekStart(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0 Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday as week start
  date.setDate(date.getDate() + diff);
  return date;
}

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
  const items = await prisma.checkIn.findMany({
    where: { clientId },
    orderBy: { weekStartDate: "desc" },
    take: 52,
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  let s;
  try {
    s = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const body = await request.json();
  const clientId = await resolveClientId(s, body.clientId ?? null);
  if (!clientId) return NextResponse.json({ error: "clientId requerido" }, { status: 400 });

  const date = body.weekStartDate ? new Date(body.weekStartDate) : new Date();
  const ws = weekStart(date);

  const upserted = await prisma.checkIn.upsert({
    where: { clientId_weekStartDate: { clientId, weekStartDate: ws } },
    update: {
      weight: num(body.weight),
      mood: int(body.mood),
      energy: int(body.energy),
      stress: int(body.stress),
      sleepQuality: int(body.sleepQuality),
      hunger: int(body.hunger),
      notes: body.notes ?? null,
    },
    create: {
      clientId,
      weekStartDate: ws,
      weight: num(body.weight),
      mood: int(body.mood),
      energy: int(body.energy),
      stress: int(body.stress),
      sleepQuality: int(body.sleepQuality),
      hunger: int(body.hunger),
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(upserted, { status: 201 });
}

function num(v: unknown): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}
function int(v: unknown): number | null {
  const n = num(v);
  return n == null ? null : Math.round(n);
}
