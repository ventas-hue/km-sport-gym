import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { parseVideoUrl } from "@/lib/video";

export async function GET(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const v = await prisma.video.findUnique({ where: { id } });
  if (!v) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(v);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const body = await request.json();
  const info = body.url ? parseVideoUrl(body.url) : null;

  const updated = await prisma.video.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description ?? null,
      url: body.url,
      category: body.category,
      tags: body.tags ?? null,
      thumbnailUrl: body.thumbnailUrl || info?.thumbnailUrl || null,
      durationSec: body.durationSec ? parseInt(body.durationSec) : null,
      isPublic: body.isPublic !== false,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  await prisma.video.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
