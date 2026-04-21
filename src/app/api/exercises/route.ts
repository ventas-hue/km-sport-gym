import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") ?? "";
  const group = request.nextUrl.searchParams.get("group") ?? "";

  const exercises = await prisma.exercise.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        group ? { muscleGroup: group } : {},
      ],
    },
    orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(exercises);
}

export async function POST(request: NextRequest) {
  try {
    await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }

  const body = await request.json();
  if (!body.name || !body.muscleGroup) {
    return NextResponse.json(
      { error: "Nombre y grupo muscular son requeridos" },
      { status: 400 }
    );
  }

  const exercise = await prisma.exercise.create({
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
  return NextResponse.json(exercise, { status: 201 });
}
