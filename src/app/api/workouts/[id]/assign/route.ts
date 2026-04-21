import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const body = await request.json();
  const clientId = body.clientId as string | null;

  // clientId === null unassigns; else becomes an assigned routine
  const workout = await prisma.workout.update({
    where: { id },
    data: {
      clientId: clientId || null,
      isTemplate: !clientId,
    },
  });
  return NextResponse.json(workout);
}
