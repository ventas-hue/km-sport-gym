import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }
  const items = await prisma.checkIn.findMany({
    include: { client: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: [{ coachReadAt: "asc" }, { weekStartDate: "desc" }],
    take: 100,
  });
  return NextResponse.json(items);
}
