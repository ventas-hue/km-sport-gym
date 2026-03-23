import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const membership = await prisma.membership.update({
    where: { id },
    data: {
      status: body.status,
      amountPaid: body.amountPaid ? parseFloat(body.amountPaid) : undefined,
      paymentMethod: body.paymentMethod,
    },
  });
  return NextResponse.json(membership);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.membership.update({ where: { id }, data: { status: "cancelled" } });
  return NextResponse.json({ success: true });
}
