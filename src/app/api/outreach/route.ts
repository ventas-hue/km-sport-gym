import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }

  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const yesterday7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const yesterday14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // 1. Membresías por vencer en los próximos 3 días
  const expiringSoon = await prisma.membership.findMany({
    where: {
      endDate: { gte: now, lte: in3Days },
      status: "active",
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, phone: true } },
      package: { select: { name: true, price: true } },
    },
    orderBy: { endDate: "asc" },
  });

  // 2. Membresías vencidas en últimos 14 días (recuperables)
  const expired = await prisma.membership.findMany({
    where: {
      endDate: { gte: yesterday14, lt: now },
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, phone: true } },
      package: { select: { name: true, price: true } },
    },
    orderBy: { endDate: "desc" },
  });

  // 3. Clientes con membresía activa que llevan 7+ días sin asistir
  const activeMembers = await prisma.membership.findMany({
    where: {
      endDate: { gte: now },
      status: "active",
    },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          attendances: {
            orderBy: { checkedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });
  const inactive = activeMembers
    .filter((m) => {
      const last = m.client.attendances[0];
      return !last || new Date(last.checkedAt) < yesterday7;
    })
    .map((m) => ({
      client: {
        id: m.client.id,
        firstName: m.client.firstName,
        lastName: m.client.lastName,
        phone: m.client.phone,
      },
      lastAttendanceAt: m.client.attendances[0]?.checkedAt ?? null,
    }));

  // 4. Check-ins semanales sin coach feedback
  const pendingFeedback = await prisma.checkIn.findMany({
    where: {
      coachFeedback: null,
      createdAt: { gte: yesterday7 },
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    expiringSoon: expiringSoon.map((m) => ({
      membershipId: m.id,
      daysToExpire: Math.ceil(
        (new Date(m.endDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      ),
      endDate: m.endDate,
      client: m.client,
      package: m.package,
    })),
    expired: expired.map((m) => ({
      membershipId: m.id,
      daysExpired: Math.ceil(
        (now.getTime() - new Date(m.endDate).getTime()) / (24 * 60 * 60 * 1000)
      ),
      endDate: m.endDate,
      client: m.client,
      package: m.package,
    })),
    inactive,
    pendingFeedback: pendingFeedback.map((c) => ({
      checkinId: c.id,
      createdAt: c.createdAt,
      weight: c.weight,
      mood: c.mood,
      client: c.client,
    })),
    generatedAt: now.toISOString(),
  });
}
