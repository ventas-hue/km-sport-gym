import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { parseVideoUrl } from "@/lib/video";

export async function GET(request: NextRequest) {
  try {
    await requireSession();
  } catch (e) {
    return e as Response;
  }
  const search = request.nextUrl.searchParams.get("search") ?? "";
  const category = request.nextUrl.searchParams.get("category") ?? "";

  const videos = await prisma.video.findMany({
    where: {
      AND: [
        { isPublic: true },
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { tags: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        category ? { category } : {},
      ],
    },
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(videos);
}

export async function POST(request: NextRequest) {
  try {
    await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const body = await request.json();
  if (!body.title || !body.url || !body.category) {
    return NextResponse.json(
      { error: "Titulo, URL y categoria son requeridos" },
      { status: 400 }
    );
  }

  const info = parseVideoUrl(body.url);

  const video = await prisma.video.create({
    data: {
      title: body.title,
      description: body.description || null,
      url: body.url,
      category: body.category,
      tags: body.tags || null,
      thumbnailUrl: body.thumbnailUrl || info.thumbnailUrl,
      durationSec: body.durationSec ? parseInt(body.durationSec) : null,
      isPublic: body.isPublic !== false,
    },
  });
  return NextResponse.json(video, { status: 201 });
}
