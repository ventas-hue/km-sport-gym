import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function GET(_r: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  let s;
  try {
    s = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { userId } = await params;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: s.userId, recipientId: userId },
        { senderId: userId, recipientId: s.userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  // mark received as read
  await prisma.message.updateMany({
    where: { senderId: userId, recipientId: s.userId, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  let s;
  try {
    s = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { userId } = await params;
  const body = await request.json();
  const content = String(body.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "Mensaje vacio" }, { status: 400 });

  const m = await prisma.message.create({
    data: {
      senderId: s.userId,
      recipientId: userId,
      content,
      attachmentUrl: body.attachmentUrl ?? null,
    },
  });
  return NextResponse.json(m, { status: 201 });
}
