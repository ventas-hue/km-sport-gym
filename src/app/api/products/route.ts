import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description || null,
      price: parseFloat(body.price),
      stock: parseInt(body.stock) || 0,
      category: body.category || "general",
    },
  });
  return NextResponse.json(product, { status: 201 });
}
