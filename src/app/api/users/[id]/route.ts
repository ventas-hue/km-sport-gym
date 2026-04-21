import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireSession } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession(["admin"]);
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {
    firstName: body.firstName,
    lastName: body.lastName,
    phone: body.phone ?? null,
    role: body.role,
    isActive: body.isActive ?? true,
  };
  if (body.password && String(body.password).length >= 6) {
    data.passwordHash = await hashPassword(body.password);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
    },
  });
  return NextResponse.json(user);
}

export async function DELETE(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession(["admin"]);
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  // soft delete by deactivating — avoids cascading issues
  await prisma.user.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
