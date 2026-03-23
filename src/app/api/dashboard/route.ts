import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const inSevenDays = new Date();
  inSevenDays.setDate(inSevenDays.getDate() + 7);

  const [
    totalClients,
    activeMemberships,
    expiringMemberships,
    expiredCount,
    monthlyMembershipIncome,
    monthlyDayPassIncome,
    monthlySalesIncome,
    monthlyPurchasesTotal,
    monthlyExpensesTotal,
    recentMemberships,
    expiringSoon,
    expiredMemberships,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.membership.count({ where: { status: "active", endDate: { gte: now } } }),
    prisma.membership.count({
      where: { status: "active", endDate: { gte: now, lte: inSevenDays } },
    }),
    prisma.membership.count({
      where: {
        endDate: { lt: now },
        status: { notIn: ["cancelled", "renewed"] },
      },
    }),
    prisma.membership.aggregate({
      where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amountPaid: true },
    }),
    prisma.dayPass.aggregate({
      where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amountPaid: true },
    }),
    prisma.sale.aggregate({
      where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { totalAmount: true },
    }),
    prisma.purchase.aggregate({
      where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { totalAmount: true },
    }),
    prisma.expense.aggregate({
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    }),
    prisma.membership.findMany({
      include: { client: true, package: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.membership.findMany({
      where: { status: "active", endDate: { gte: now, lte: inSevenDays } },
      include: { client: true, package: true },
      orderBy: { endDate: "asc" },
    }),
    prisma.membership.findMany({
      where: {
        endDate: { lt: now },
        status: { notIn: ["cancelled", "renewed"] },
      },
      include: { client: true, package: true },
      orderBy: { endDate: "desc" },
    }),
  ]);

  const membershipIncome = monthlyMembershipIncome._sum.amountPaid || 0;
  const dayPassIncome = monthlyDayPassIncome._sum.amountPaid || 0;
  const salesIncome = monthlySalesIncome._sum.totalAmount || 0;
  const purchasesTotal = monthlyPurchasesTotal._sum.totalAmount || 0;
  const expensesTotal = monthlyExpensesTotal._sum.amount || 0;

  return NextResponse.json({
    totalClients,
    activeMemberships,
    expiringMemberships,
    expiredCount,
    monthlyIncome: membershipIncome + dayPassIncome + salesIncome,
    membershipIncome,
    dayPassIncome,
    salesIncome,
    purchasesTotal,
    expensesTotal,
    recentMemberships,
    expiringSoon,
    expiredMemberships,
  });
}
