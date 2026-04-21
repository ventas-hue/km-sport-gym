import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

async function resolveClientId(s: { userId: string; role: string }, q: string | null) {
  if (s.role === "member") {
    const u = await prisma.user.findUnique({ where: { id: s.userId } });
    return u?.clientId ?? null;
  }
  return q;
}

export async function GET(request: NextRequest) {
  let s;
  try {
    s = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const clientId = await resolveClientId(s, request.nextUrl.searchParams.get("clientId"));
  if (!clientId) return NextResponse.json([]);
  const records = await prisma.personalRecord.findMany({
    where: { clientId },
    include: { exercise: { select: { name: true, muscleGroup: true } } },
    orderBy: [{ exercise: { muscleGroup: "asc" } }, { value: "desc" }],
  });
  return NextResponse.json(records);
}
