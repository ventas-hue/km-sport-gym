import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const purchases = await prisma.purchase.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(purchases);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { supplier, notes, paymentMethod, items } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Debe agregar al menos un producto" }, { status: 400 });
  }

  let totalAmount = 0;
  const itemsData = items.map((item: { productId: string; quantity: number; unitCost: number }) => {
    const subtotal = item.quantity * item.unitCost;
    totalAmount += subtotal;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      subtotal,
    };
  });

  const purchase = await prisma.$transaction(async (tx) => {
    const p = await tx.purchase.create({
      data: {
        supplier,
        notes: notes || null,
        totalAmount,
        paymentMethod: paymentMethod || "efectivo",
        items: { create: itemsData },
      },
      include: { items: { include: { product: true } } },
    });

    // Incrementar stock de cada producto
    for (const item of itemsData) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return p;
  });

  return NextResponse.json(purchase, { status: 201 });
}
