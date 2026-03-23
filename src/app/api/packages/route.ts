import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const packages = await prisma.package.findMany({
    orderBy: { price: "asc" },
  });
  return NextResponse.json(packages);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const pkg = await prisma.package.create({
    data: {
      name: body.name,
      description: body.description || null,
      price: parseFloat(body.price),
      durationDays: parseInt(body.durationDays),
      isActive: body.isActive ?? true,
    },
  });
  return NextResponse.json(pkg, { status: 201 });
}
