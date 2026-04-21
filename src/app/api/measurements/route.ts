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
  const items = await prisma.bodyMeasurement.findMany({
    where: { clientId },
    orderBy: { date: "asc" },
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

  const created = await prisma.bodyMeasurement.create({
    data: {
      clientId,
      date: body.date ? new Date(body.date) : new Date(),
      weight: num(body.weight),
      bodyFatPct: num(body.bodyFatPct),
      chest: num(body.chest),
      waist: num(body.waist),
      hips: num(body.hips),
      leftArm: num(body.leftArm),
      rightArm: num(body.rightArm),
      leftThigh: num(body.leftThigh),
      rightThigh: num(body.rightThigh),
      neck: num(body.neck),
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(created, { status: 201 });
}

function num(v: unknown): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}
