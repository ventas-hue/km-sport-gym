import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { order: "asc" },
        include: { upload: { select: { id: true, mimeType: true } } },
      },
    },
  });
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    ...post,
    images: post.images.map((pi) => ({
      id: pi.upload.id,
      url: `/api/uploads/${pi.upload.id}`,
      order: pi.order,
    })),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const body = await request.json();

  const updated = await prisma.$transaction(async (tx) => {
    await tx.postImage.deleteMany({ where: { postId: id } });
    return tx.post.update({
      where: { id },
      data: {
        title: body.title ?? null,
        body: body.body ?? null,
        tags: body.tags ?? null,
        isPublished: body.isPublished ?? true,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
        images: {
          create: (body.images ?? []).map(
            (uploadId: string, idx: number) => ({ uploadId, order: idx })
          ),
        },
      },
      include: { images: true },
    });
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
