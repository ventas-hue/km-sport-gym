import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch (e) {
    return e as Response;
  }

  if (session.role === "member") {
    // member talks to admins and coaches
    const staff = await prisma.user.findMany({
      where: { role: { in: ["admin", "coach"] }, isActive: true },
      select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true },
      orderBy: [{ role: "asc" }, { firstName: "asc" }],
    });
    return NextResponse.json(staff);
  }

  // coach/admin sees all members
  const members = await prisma.user.findMany({
    where: { role: "member", isActive: true },
    select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true },
    orderBy: [{ firstName: "asc" }],
  });
  return NextResponse.json(members);
}
