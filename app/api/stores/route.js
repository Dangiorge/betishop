import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function GET() {
  try {
    const { db } = await getTenantDb();
    const stores = await db.store.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(stores);
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
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") {
      return NextResponse.json(
        { error: "Only the shop admin can add stores" },
        { status: 403 },
      );
    }

    const {
      name,
      address,
      allowGRN,
      allowInternalTransfer,
      allowDisposal,
      allowPurchaseRequest,
      allowSales,
    } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const store = await db.store.create({
      data: {
        name: name.trim(),
        address: address?.trim() || null,
        allowGRN: allowGRN ?? true,
        allowInternalTransfer: allowInternalTransfer ?? true,
        allowDisposal: allowDisposal ?? true,
        allowPurchaseRequest: allowPurchaseRequest ?? true,
        allowSales: allowSales ?? true,
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (e) {
    if (e.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "A store with that name already exists" },
        { status: 409 },
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
