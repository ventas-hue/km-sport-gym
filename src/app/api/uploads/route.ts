import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/uploads  (multipart/form-data)
// Field: "file" (single file) or "files" (multiple)
// Returns: [{ id, filename, mimeType, sizeBytes, url }]
export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }

  const form = await request.formData();
  const list: File[] = [];
  for (const [key, value] of form.entries()) {
    if (value instanceof File && (key === "file" || key === "files")) {
      list.push(value);
    }
  }
  if (list.length === 0) {
    return NextResponse.json({ error: "No files" }, { status: 400 });
  }

  const MAX = 10 * 1024 * 1024; // 10 MB
  const created: Array<{
    id: string;
    filename: string | null;
    mimeType: string;
    sizeBytes: number;
    url: string;
  }> = [];

  for (const file of list) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: `${file.name}: no es imagen` },
        { status: 400 }
      );
    }
    if (file.size > MAX) {
      return NextResponse.json(
        { error: `${file.name}: excede 10MB` },
        { status: 413 }
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const rec = await prisma.upload.create({
      data: {
        filename: file.name,
        mimeType: file.type,
        sizeBytes: buf.byteLength,
        data: buf,
        uploadedBy: session.email,
      },
      select: { id: true, filename: true, mimeType: true, sizeBytes: true },
    });
    created.push({ ...rec, url: `/api/uploads/${rec.id}` });
  }

  return NextResponse.json({ files: created });
}
