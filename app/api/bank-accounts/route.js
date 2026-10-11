import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function GET() {
  try {
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    return NextResponse.json(await db.bankAccount.findMany({ orderBy: { createdAt: "desc" } }));
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") return NextResponse.json({ error: "Only the shop owner can manage bank accounts" }, { status: 403 });
    const { name, bankName, accountLast4, openingBalance } = await request.json();
    if (!name?.trim() || !bankName?.trim() || !Number.isFinite(Number(openingBalance ?? 0))) return NextResponse.json({ error: "Account name, bank name, and a valid opening balance are required" }, { status: 400 });
    const account = await db.bankAccount.create({ data: { name: name.trim(), bankName: bankName.trim(), accountLast4: accountLast4?.replace(/\D/g, "").slice(-4) || null, openingBalance: Number(openingBalance ?? 0) } });
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") return NextResponse.json({ error: "That account name is already in use" }, { status: 409 });
    return NextResponse.json({ error: "Could not create bank account" }, { status: 500 });
  }
}
