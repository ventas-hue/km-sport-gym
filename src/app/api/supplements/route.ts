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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const items = await prisma.supplement.findMany({
    where: { clientId, isActive: true },
    include: {
      logs: {
        where: { date: { gte: today } },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
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

  const supp = await prisma.supplement.create({
    data: {
      clientId,
      name: body.name,
      dose: body.dose ?? null,
      timing: body.timing ?? null,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(supp, { status: 201 });
}
