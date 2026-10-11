import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getTenantDb } from "@/lib/tenant-db";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { tenantId, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    const users = await prisma.user.findMany({ where: { tenantId, role: "SALES_PERSON" }, include: { assignedStore: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(users.map(({ hashedPassword, ...user }) => user));
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    const { db, tenantId, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") return NextResponse.json({ error: "Only the shop owner can add sales staff" }, { status: 403 });
    const { name, email, password, storeId, commissionRate } = await request.json();
    if (!name?.trim() || !email?.trim() || !password || password.length < 8 || !storeId) return NextResponse.json({ error: "Name, email, store, and a password of at least 8 characters are required" }, { status: 400 });
    const store = await db.store.findUnique({ where: { id: storeId } });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 400 });
    const rate = commissionRate === "" || commissionRate == null ? null : Number(commissionRate);
    if (rate !== null && (!Number.isFinite(rate) || rate < 0 || rate > 100)) return NextResponse.json({ error: "Commission must be between 0 and 100 percent" }, { status: 400 });
    const user = await prisma.user.create({ data: { tenantId, name: name.trim(), email: email.trim().toLowerCase(), hashedPassword: await bcrypt.hash(password, 10), role: "SALES_PERSON", assignedStoreId: storeId, commissionRate: rate } });
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") return NextResponse.json({ error: "An account already exists with that email" }, { status: 409 });
    return NextResponse.json({ error: "Could not create sales account" }, { status: 500 });
  }
}
