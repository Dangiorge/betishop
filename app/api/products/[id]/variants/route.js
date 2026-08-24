import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") {
      return NextResponse.json(
        { error: "Only the shop admin can add variants" },
        { status: 403 },
      );
    }

    const { color, size, sku, costPrice, sellPrice } = await req.json();

    if (costPrice == null || sellPrice == null) {
      return NextResponse.json(
        { error: "Cost price and sell price are required" },
        { status: 400 },
      );
    }

    const variant = await db.variant.create({
      data: {
        productId: id,
        color: color?.trim() || null,
        size: size?.trim() || null,
        sku: sku?.trim() || null,
        costPrice,
        sellPrice,
      },
    });

    return NextResponse.json(variant, { status: 201 });
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
