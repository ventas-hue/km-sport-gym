import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const upload = await prisma.upload.findUnique({
    where: { id },
    select: { data: true, mimeType: true, sizeBytes: true },
  });
  if (!upload) {
    return new NextResponse("Not found", { status: 404 });
  }
  const buffer = upload.data as unknown as Buffer;
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": upload.mimeType,
      "Content-Length": String(upload.sizeBytes),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
