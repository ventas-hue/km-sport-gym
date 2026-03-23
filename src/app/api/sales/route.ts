import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const sales = await prisma.sale.findMany({
    include: { product: true, client: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(sales);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 400 });

  if (product.stock < (body.quantity || 1)) {
    return NextResponse.json({ error: "Stock insuficiente" }, { status: 400 });
  }

  const quantity = parseInt(body.quantity) || 1;
  const totalAmount = product.price * quantity;

  const [sale] = await prisma.$transaction([
    prisma.sale.create({
      data: {
        productId: body.productId,
        clientId: body.clientId || null,
        quantity,
        totalAmount,
      },
      include: { product: true, client: true },
    }),
    prisma.product.update({
      where: { id: body.productId },
      data: { stock: { decrement: quantity } },
    }),
  ]);

  return NextResponse.json(sale, { status: 201 });
}
