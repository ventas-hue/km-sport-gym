import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const expiringSoon = searchParams.get("expiringSoon");

  const where: Record<string, unknown> = {};

  if (status) where.status = status;
  if (expiringSoon === "true") {
    const now = new Date();
    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    where.status = "active";
    where.endDate = { gte: now, lte: inSevenDays };
  }

  const memberships = await prisma.membership.findMany({
    where,
    include: { client: true, package: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(memberships);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const pkg = await prisma.package.findUnique({ where: { id: body.packageId } });
  if (!pkg) return NextResponse.json({ error: "Paquete no encontrado" }, { status: 400 });

  const startDate = new Date(body.startDate || new Date());
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + pkg.durationDays);

  const membership = await prisma.membership.create({
    data: {
      clientId: body.clientId,
      packageId: body.packageId,
      startDate,
      endDate,
      amountPaid: body.amountPaid ?? pkg.price,
      paymentMethod: body.paymentMethod || "efectivo",
      status: "active",
    },
    include: { client: true, package: true },
  });
  return NextResponse.json(membership, { status: 201 });
}
