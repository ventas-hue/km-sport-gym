import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * POST /api/quick-log
 *   { kind: "weight"|"water_cup"|"sleep", value?: number }
 * Guarda rápido para el día de hoy del miembro autenticado.
 */
export async function POST(request: NextRequest) {
  const user = await getUserFromSession();
  if (!user || !user.clientId) {
    return NextResponse.json({ error: "no client linked" }, { status: 401 });
  }
  const clientId = user.clientId;
  const body = await request.json();
  const kind = body.kind as string;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (kind === "weight") {
    const weight = Number(body.value);
    if (!weight || weight <= 0) {
      return NextResponse.json({ error: "weight inválido" }, { status: 400 });
    }
    const existing = await prisma.bodyMeasurement.findFirst({
      where: { clientId, date: { gte: startOfDay } },
      orderBy: { date: "desc" },
    });
    const row = existing
      ? await prisma.bodyMeasurement.update({
          where: { id: existing.id },
          data: { weight },
        })
      : await prisma.bodyMeasurement.create({
          data: { clientId, date: now, weight },
        });
    return NextResponse.json({ ok: true, measurement: row });
  }

  if (kind === "water_cup") {
    // Cada tap suma 0.25L a la lectura de hoy
    const log = await prisma.wellnessLog.upsert({
      where: { clientId_date: { clientId, date: startOfDay } },
      update: {
        waterLiters: { increment: Number(body.value ?? 0.25) },
      },
      create: {
        clientId,
        date: startOfDay,
        waterLiters: Number(body.value ?? 0.25),
      },
    });
    return NextResponse.json({ ok: true, log });
  }

  if (kind === "water_set") {
    const liters = Number(body.value);
    const log = await prisma.wellnessLog.upsert({
      where: { clientId_date: { clientId, date: startOfDay } },
      update: { waterLiters: liters },
      create: { clientId, date: startOfDay, waterLiters: liters },
    });
    return NextResponse.json({ ok: true, log });
  }

  if (kind === "sleep") {
    const hours = Number(body.value);
    if (hours <= 0 || hours > 24) {
      return NextResponse.json({ error: "horas inválidas" }, { status: 400 });
    }
    const log = await prisma.wellnessLog.upsert({
      where: { clientId_date: { clientId, date: startOfDay } },
      update: { sleepHours: hours },
      create: { clientId, date: startOfDay, sleepHours: hours },
    });
    return NextResponse.json({ ok: true, log });
  }

  if (kind === "mood") {
    const mood = Number(body.value);
    const log = await prisma.wellnessLog.upsert({
      where: { clientId_date: { clientId, date: startOfDay } },
      update: { mood },
      create: { clientId, date: startOfDay, mood },
    });
    return NextResponse.json({ ok: true, log });
  }

  return NextResponse.json({ error: "kind no soportado" }, { status: 400 });
}
