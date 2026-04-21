import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(exercise);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }

  const { id } = await params;
  const body = await request.json();
  const exercise = await prisma.exercise.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description || null,
      muscleGroup: body.muscleGroup,
      equipment: body.equipment || null,
      videoUrl: body.videoUrl || null,
      imageUrl: body.imageUrl || null,
      instructions: body.instructions || null,
    },
  });
  return NextResponse.json(exercise);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession(["admin"]);
  } catch (e) {
    return e as Response;
  }

  const { id } = await params;
  await prisma.exercise.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
