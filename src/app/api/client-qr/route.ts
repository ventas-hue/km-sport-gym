import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getUserFromSession } from "@/lib/auth";
import { ensureQrToken } from "@/lib/qr";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let clientId = request.nextUrl.searchParams.get("clientId");
  if (session.role === "member" || !clientId) {
    const user = await getUserFromSession();
    clientId = user?.clientId ?? null;
  }
  if (!clientId) {
    return NextResponse.json({ error: "no client linked" }, { status: 404 });
  }

  const token = await ensureQrToken(clientId);
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, firstName: true, lastName: true, qrToken: true },
  });
  return NextResponse.json({
    clientId,
    token,
    client,
  });
}
