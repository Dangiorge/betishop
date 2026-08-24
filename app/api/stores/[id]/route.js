import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") {
      return NextResponse.json(
        { error: "Only the shop admin can edit stores" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      name,
      address,
      allowGRN,
      allowInternalTransfer,
      allowDisposal,
      allowPurchaseRequest,
      allowSales,
    } = body;

    const store = await db.store.update({
      where: { id },
      data: {
        name: name?.trim(),
        address: address?.trim() || null,
        allowGRN,
        allowInternalTransfer,
        allowDisposal,
        allowPurchaseRequest,
        allowSales,
      },
    });

    return NextResponse.json(store);
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

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") {
      return NextResponse.json(
        { error: "Only the shop admin can delete stores" },
        { status: 403 },
      );
    }

    const stockCount = await db.storeStock.count({
      where: { storeId: id, qty: { gt: 0 } },
    });
    if (stockCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete: this store still has stock. Transfer or dispose of it first",
        },
        { status: 409 },
      );
    }

    await db.store.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
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
