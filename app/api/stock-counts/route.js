import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function POST(request) {
  try {
    const { db, session, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") return NextResponse.json({ error: "Only the shop owner can reconcile stock" }, { status: 403 });
    const { storeId, items } = await request.json();
    if (!storeId || !Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "Choose a store and count at least one item" }, { status: 400 });
    if (items.some((item) => !item.variantId || !Number.isInteger(Number(item.countedQty)) || Number(item.countedQty) < 0)) return NextResponse.json({ error: "Every count must be a whole number zero or greater" }, { status: 400 });
    if (new Set(items.map((item) => item.variantId)).size !== items.length) return NextResponse.json({ error: "Each item can only be counted once per count" }, { status: 400 });
    if (!(await db.store.findUnique({ where: { id: storeId } }))) return NextResponse.json({ error: "Store not found" }, { status: 400 });

    const result = await db.$transaction(async (tx) => {
      let corrections = 0;
      for (const item of items) {
        const variant = await tx.variant.findFirst({ where: { id: item.variantId }, select: { id: true } });
        if (!variant) throw new Error("A selected item was not found");
        const stock = await tx.storeStock.findFirst({ where: { storeId, variantId: variant.id } });
        const systemQty = stock?.qty ?? 0;
        const countedQty = Number(item.countedQty);
        const variance = countedQty - systemQty;
        await tx.storeStock.upsert({ where: { storeId_variantId: { storeId, variantId: variant.id } }, update: { qty: countedQty }, create: { storeId, variantId: variant.id, qty: countedQty } });
        await tx.stockCount.create({ data: { storeId, variantId: variant.id, systemQty, countedQty, variance, countedById: session.user.id } });
        if (variance) {
          await tx.stockMovement.create({ data: { storeId, variantId: variant.id, type: "COUNT_CORRECTION", qtyChange: variance, employeeId: session.user.id, note: `Stock count at ${storeId}` } });
          corrections++;
        }
      }
      return { counted: items.length, corrections };
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const status = error.message === "UNAUTHENTICATED" ? 401 : error.message.includes("not found") ? 400 : 500;
    if (status === 500) console.error(error);
    return NextResponse.json({ error: status === 500 ? "Could not save stock count" : error.message }, { status });
  }
}
