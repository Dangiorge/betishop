import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function POST(request) {
  try {
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") return NextResponse.json({ error: "Only the shop owner can close a period" }, { status: 403 });
    const { startDate, endDate } = await request.json();
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (!startDate || !endDate || Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || end < start) return NextResponse.json({ error: "Choose a valid date range" }, { status: 400 });
    end.setDate(end.getDate() + 1);
    const [sales, expenseTotal] = await Promise.all([
      db.sale.findMany({ where: { createdAt: { gte: start, lt: end } }, include: { employee: { select: { commissionRate: true } }, variant: { select: { costPrice: true } } } }),
      db.expense.aggregate({ where: { date: { gte: start, lt: end } }, _sum: { amount: true } }),
    ]);
    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.priceAtSale) * sale.qty, 0);
    const costOfGoods = sales.reduce((sum, sale) => sum + Number(sale.costAtSale ?? sale.variant.costPrice) * sale.qty, 0);
    const totalExpenses = Number(expenseTotal._sum.amount ?? 0);
    const totalCommissions = sales.reduce((sum, sale) => sum + Number(sale.priceAtSale) * sale.qty * Number(sale.employee.commissionRate ?? 0) / 100, 0);
    const closing = await db.closingPeriod.create({ data: { startDate: start, endDate: new Date(end.getTime() - 1), totalSales, costOfGoods, totalExpenses, totalCommissions, netResult: totalSales - costOfGoods - totalExpenses - totalCommissions } });
    return NextResponse.json(closing, { status: 201 });
  } catch (error) {
    if (error.message === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(error);
    return NextResponse.json({ error: "Could not calculate closing period" }, { status: 500 });
  }
}
