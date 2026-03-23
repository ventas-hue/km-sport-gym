import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const dayPasses = await prisma.dayPass.findMany({
    include: { client: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(dayPasses);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const dayPass = await prisma.dayPass.create({
    data: {
      clientId: body.clientId || null,
      clientName: body.clientName || null,
      date: new Date(body.date || new Date()),
      amountPaid: parseFloat(body.amountPaid),
    },
    include: { client: true },
  });
  return NextResponse.json(dayPass, { status: 201 });
}
