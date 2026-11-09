import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireSession } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/posts?published=true&tag=galeria&limit=50
export async function GET(request: NextRequest) {
  const session = await getSession();
  const p = request.nextUrl.searchParams;
  const publishedParam = p.get("published");
  const tag = p.get("tag");
  const limit = Math.min(Number(p.get("limit") ?? 50) || 50, 200);

  // Público ve solo publicados. Admin/coach pueden ver todos.
  const onlyPublished =
    publishedParam === null
      ? !session || session.role === "member"
      : publishedParam === "true";

  const where: Record<string, unknown> = {};
  if (onlyPublished) where.isPublished = true;
  if (tag) where.tags = { contains: tag };

  const posts = await prisma.post.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      images: {
        orderBy: { order: "asc" },
        include: {
          upload: {
            select: { id: true, mimeType: true, width: true, height: true },
          },
        },
      },
    },
  });

  return NextResponse.json(
    posts.map((p) => ({
      id: p.id,
      title: p.title,
      body: p.body,
      tags: p.tags,
      isPublished: p.isPublished,
      publishedAt: p.publishedAt,
      images: p.images.map((pi) => ({
        id: pi.upload.id,
        url: `/api/uploads/${pi.upload.id}`,
        order: pi.order,
        width: pi.upload.width,
        height: pi.upload.height,
      })),
    }))
  );
}

// POST /api/posts  { title, body, tags, images: [uploadId, ...], isPublished }
export async function POST(request: NextRequest) {
  try {
    await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const body = await request.json();
  const post = await prisma.post.create({
    data: {
      title: body.title ?? null,
      body: body.body ?? null,
      tags: body.tags ?? null,
      isPublished: body.isPublished ?? true,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
      images: {
        create: (body.images ?? []).map((uploadId: string, idx: number) => ({
          uploadId,
          order: idx,
        })),
      },
    },
    include: { images: true },
  });
  return NextResponse.json(post);
}
