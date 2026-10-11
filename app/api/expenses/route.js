import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

const categories = ["TRANSPORT", "RENT", "SALARY", "OTHER"];

export async function GET() {
  try {
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    return NextResponse.json(await db.expense.findMany({ include: { bankAccount: { select: { name: true, bankName: true } } }, orderBy: { date: "desc" }, take: 250 }));
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") return NextResponse.json({ error: "Only the shop owner can record expenses" }, { status: 403 });
    const { category, customCategory, amount, date, note, paymentMethod = "CASH", bankAccountId } = await request.json();
    const value = Number(amount);
    if (!categories.includes(category) || !Number.isFinite(value) || value <= 0 || !date) return NextResponse.json({ error: "Choose a category and enter a valid amount and date" }, { status: 400 });
    if (category === "OTHER" && !customCategory?.trim()) return NextResponse.json({ error: "Enter the expense type" }, { status: 400 });
    if (!["CASH", "BANK", "MOBILE_MONEY", "OTHER"].includes(paymentMethod)) return NextResponse.json({ error: "Choose a payment method" }, { status: 400 });
    if (paymentMethod === "BANK" && !bankAccountId) return NextResponse.json({ error: "Choose the bank account used" }, { status: 400 });
    if (paymentMethod === "BANK" && !(await db.bankAccount.findFirst({ where: { id: bankAccountId, active: true } }))) return NextResponse.json({ error: "Bank account not found" }, { status: 400 });
    const expense = await db.expense.create({ data: { category, customCategory: category === "OTHER" ? customCategory.trim() : null, amount: value, date: new Date(date), note: note?.trim() || null, paymentMethod, bankAccountId: paymentMethod === "BANK" ? bankAccountId : null } });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error.code === "P2003") return NextResponse.json({ error: "Bank account not found" }, { status: 400 });
    return NextResponse.json({ error: "Could not save expense" }, { status: 500 });
  }
}
