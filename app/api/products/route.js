import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function GET() {
  try {
    const { db, role, session } = await getTenantDb();
    const products = await db.product.findMany({
      include: { category: true, variants: { select: { id: true, sku: true, color: true, size: true, sellPrice: true, createdAt: true, storeStocks: { where: role === "SALES_PERSON" || role === "EMPLOYEE" ? { storeId: session.user.assignedStoreId ?? "" } : {}, select: { storeId: true, qty: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
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
    const { db, role, tenantId } = await getTenantDb();
    if (role !== "TENANT_ADMIN") {
      return NextResponse.json(
        { error: "Only the shop admin can add products" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      name,
      categoryId,
      type,
      description,
      brand,
      gender,
      material,
      countryOfOrigin,
      tags,
      imageUrl,
      defaultVariant,
    } = body;

    if (!name?.trim() || !categoryId || !type) {
      return NextResponse.json(
        { error: "Name, category, and type are required" },
        { status: 400 },
      );
    }

    if (type === "BAG" && (
      !Number.isFinite(Number(defaultVariant?.costPrice)) ||
      Number(defaultVariant?.costPrice) < 0 ||
      !Number.isFinite(Number(defaultVariant?.sellPrice)) ||
      Number(defaultVariant?.sellPrice) <= 0
    )) {
      return NextResponse.json(
        { error: "Bags need a cost price and a selling price greater than zero." },
        { status: 400 },
      );
    }

    const category = await db.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 },
      );
    }

    const product = await db.product.create({
      data: {
        name: name.trim(),
        categoryId,
        type,
        description: description?.trim() || null,
        brand: brand?.trim() || null,
        gender: gender || null,
        material: material?.trim() || null,
        countryOfOrigin: countryOfOrigin?.trim() || null,
        tags: Array.isArray(tags)
          ? tags
          : tags
            ? tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
        imageUrl: imageUrl || null,
        ...(type === "BAG"
          ? {
              variants: {
                create: {
                  tenantId,
                  color: null,
                  size: null,
                  sku: null,
                  costPrice: Number(defaultVariant.costPrice),
                  sellPrice: Number(defaultVariant.sellPrice),
                },
              },
            }
          : {}),
      },
    });

    return NextResponse.json(product, { status: 201 });
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
