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
  const items = await prisma.goal.findMany({
    where: { clientId },
    include: { milestones: { orderBy: { targetValue: "asc" } } },
    orderBy: { createdAt: "desc" },
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

  const goal = await prisma.goal.create({
    data: {
      clientId,
      title: body.title,
      description: body.description ?? null,
      startValue: num(body.startValue),
      currentValue: num(body.currentValue ?? body.startValue),
      targetValue: num(body.targetValue),
      unit: body.unit ?? null,
      direction: body.direction ?? "decrease",
      deadline: body.deadline ? new Date(body.deadline) : null,
    },
  });
  return NextResponse.json(goal, { status: 201 });
}

function num(v: unknown): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}
