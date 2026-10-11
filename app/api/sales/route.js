import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";
import { isSalesRole } from "@/lib/permissions";

export async function GET() {
  try {
    const { db, session, role } = await getTenantDb();
    const where = isSalesRole(role)
      ? { employeeId: session.user.id }
      : {};
    const batches = await db.saleBatch.findMany({
      where,
      include: {
        store: { select: { name: true } },
        employee: { select: { name: true } },
        bankAccount: { select: { name: true, bankName: true } },
        items: { include: { variant: { include: { product: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(batches);
  } catch (error) {
    return NextResponse.json({ error: error.message === "UNAUTHENTICATED" ? "Unauthorized" : "Could not load sales" }, { status: error.message === "UNAUTHENTICATED" ? 401 : 500 });
  }
}

export async function POST(request) {
  try {
    const { db, session, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN" && !isSalesRole(role)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { storeId: requestedStoreId, items, paymentMethod, bankAccountId, transactionReference } = await request.json();
    const storeId = isSalesRole(role) ? session.user.assignedStoreId : requestedStoreId;
    if (!storeId || !Array.isArray(items) || !items.length) {
      return NextResponse.json({ error: "Choose a store and add at least one item" }, { status: 400 });
    }
    if (!["CASH", "BANK", "MOBILE_MONEY", "OTHER"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Choose a payment method" }, { status: 400 });
    }
    if (paymentMethod === "BANK" && !bankAccountId) {
      return NextResponse.json({ error: "Choose the bank account that received payment" }, { status: 400 });
    }
    if (items.some((item) => !item.variantId || !Number.isInteger(Number(item.qty)) || Number(item.qty) < 1)) {
      return NextResponse.json({ error: "Each item needs a variant and a positive whole quantity" }, { status: 400 });
    }

    const store = await db.store.findUnique({ where: { id: storeId } });
    if (!store || !store.allowSales) return NextResponse.json({ error: "Sales are not enabled for this store" }, { status: 400 });
    if (paymentMethod === "BANK") {
      const account = await db.bankAccount.findFirst({ where: { id: bankAccountId, active: true } });
      if (!account) return NextResponse.json({ error: "Bank account not found" }, { status: 400 });
    }

    const batch = await db.$transaction(async (tx) => {
      const created = await tx.saleBatch.create({
        data: {
          storeId,
          employeeId: session.user.id,
          paymentMethod,
          bankAccountId: paymentMethod === "BANK" ? bankAccountId : null,
          transactionReference: transactionReference?.trim() || null,
        },
      });

      for (const item of items) {
        const variant = await tx.variant.findFirst({ where: { id: item.variantId }, select: { id: true, sellPrice: true, costPrice: true } });
        if (!variant) throw new Error("One of the selected products is unavailable");
        const qty = Number(item.qty);
        const changed = await tx.storeStock.updateMany({
          where: { storeId, variantId: variant.id, qty: { gte: qty } },
          data: { qty: { decrement: qty } },
        });
        if (!changed.count) throw new Error("Not enough stock for one of the selected items");
        const price = Number(variant.sellPrice);
        await tx.sale.create({ data: { variantId: variant.id, employeeId: session.user.id, qty, priceAtSale: price, costAtSale: variant.costPrice, batchId: created.id } });
        await tx.stockMovement.create({
          data: { variantId: variant.id, storeId, type: "SALE", qtyChange: -qty, employeeId: session.user.id, note: `Sale ${created.id}` },
        });
      }
      return created;
    });
    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    const status = error.message === "UNAUTHENTICATED" ? 401 : error.message.includes("stock") || error.message.includes("unavailable") || error.message.includes("price") ? 400 : 500;
    if (status === 500) console.error(error);
    return NextResponse.json({ error: status === 500 ? "Could not save the sale" : error.message }, { status });
  }
}
