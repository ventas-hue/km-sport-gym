import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const expense = await prisma.expense.create({
    data: {
      description: body.description,
      category: body.category || "general",
      amount: parseFloat(body.amount),
      paymentMethod: body.paymentMethod || "efectivo",
      date: body.date ? new Date(body.date) : new Date(),
      notes: body.notes || null,
    },
  });
  return NextResponse.json(expense, { status: 201 });
}
