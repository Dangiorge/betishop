import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function GET() {
  try {
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    const grns = await db.gRN.findMany({
      include: {
        store: true,
        supplier: true,
        receivedBy: { select: { name: true } },
        items: {
          include: {
            variant: { include: { product: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(grns);
  } catch (e) {
    if (e.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const { db, session, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") {
      return NextResponse.json({ error: "Only the shop owner can receive inventory" }, { status: 403 });
    }
    const { storeId, supplierId, referenceNo, note, items } = await req.json();

    if (!storeId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Store and at least one item are required" },
        { status: 400 },
      );
    }

    for (const item of items) {
      if (
        !item.variantId ||
        !Number.isInteger(Number(item.qty)) ||
        Number(item.qty) <= 0 ||
        item.unitCost == null ||
        !Number.isFinite(Number(item.unitCost)) ||
        Number(item.unitCost) < 0
      ) {
        return NextResponse.json(
          {
            error:
              "Each item needs a variant, positive quantity, and unit cost",
          },
          { status: 400 },
        );
      }
    }

    const store = await db.store.findUnique({ where: { id: storeId } });
    if (!store)
      return NextResponse.json({ error: "Store not found" }, { status: 400 });
    if (!store.allowGRN) {
      return NextResponse.json(
        { error: `${store.name} is not allowed to receive GRNs` },
        { status: 403 },
      );
    }
    const variantIds = [...new Set(items.map((item) => item.variantId))];
    const validVariants = await db.variant.findMany({ where: { id: { in: variantIds } }, select: { id: true } });
    if (validVariants.length !== variantIds.length) return NextResponse.json({ error: "One or more products were not found" }, { status: 400 });
    if (supplierId && !(await db.supplier.findUnique({ where: { id: supplierId } }))) return NextResponse.json({ error: "Supplier not found" }, { status: 400 });

    const grn = await db.$transaction(async (tx) => {
      const created = await tx.gRN.create({
        data: {
          storeId,
          supplierId: supplierId || null,
          referenceNo: referenceNo?.trim() || null,
          note: note?.trim() || null,
          receivedById: session.user.id,
          status: "RECEIVED",
          items: {
            create: items.map((i) => ({
              variantId: i.variantId,
              qty: Number(i.qty),
              unitCost: i.unitCost,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of created.items) {
        await tx.storeStock.upsert({
          where: { storeId_variantId: { storeId, variantId: item.variantId } },
          update: { qty: { increment: item.qty } },
          create: { storeId, variantId: item.variantId, qty: item.qty },
        });

        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            storeId,
            type: "GRN",
            qtyChange: item.qty,
            employeeId: session.user.id,
            note: `GRN${referenceNo ? ` #${referenceNo}` : ""}`,
          },
        });
      }

      return created;
    });

    return NextResponse.json(grn, { status: 201 });
  } catch (e) {
    if (e.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
