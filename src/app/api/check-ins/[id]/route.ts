import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let s;
  try {
    s = await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const body = await request.json();
  const updated = await prisma.checkIn.update({
    where: { id },
    data: {
      coachFeedback: body.coachFeedback ?? null,
      coachReadAt: new Date(),
    },
  });
  return NextResponse.json(updated);
}
