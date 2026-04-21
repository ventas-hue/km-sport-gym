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

  const clientIdParam = request.nextUrl.searchParams.get("clientId");
  let clientId: string | null = null;

  if (session.role === "member") {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    clientId = user?.clientId ?? null;
  } else {
    clientId = clientIdParam;
  }

  if (!clientId) return NextResponse.json([]);

  const sessions = await prisma.workoutSession.findMany({
    where: { clientId },
    include: {
      workout: { select: { id: true, name: true } },
      setLogs: { include: { exercise: true } },
    },
    orderBy: { date: "desc" },
    take: 50,
  });

  return NextResponse.json(sessions);
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch (e) {
    return e as Response;
  }

  const body = await request.json();

  let clientId: string | null = body.clientId ?? null;
  if (session.role === "member") {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    clientId = user?.clientId ?? null;
  }

  if (!clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }

  const created = await prisma.workoutSession.create({
    data: {
      clientId,
      workoutId: body.workoutId ?? null,
      date: body.date ? new Date(body.date) : new Date(),
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
