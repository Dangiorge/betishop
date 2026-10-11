import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { db, role } = await getTenantDb();
    const product = await db.product.findUnique({
      where: { id },
      include: { category: true, variants: { orderBy: { createdAt: "asc" } } },
    });
    if (!product)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (role === "SALES_PERSON" || role === "EMPLOYEE") {
      product.variants = product.variants.map(({ costPrice, ...variant }) => variant);
    }
    return NextResponse.json(product);
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

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") {
      return NextResponse.json(
        { error: "Only the shop admin can edit products" },
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
    } = body;

    if (!name?.trim() || !categoryId || !type) {
      return NextResponse.json(
        { error: "Name, category, and type are required" },
        { status: 400 },
      );
    }

    const product = await db.product.update({
      where: { id },
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
      },
    });

    return NextResponse.json(product);
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
        { error: "Only the shop admin can delete products" },
        { status: 403 },
      );
    }

    const salesCount = await db.sale.count({
      where: { variant: { productId: id } },
    });
    if (salesCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete: this product has recorded sales history" },
        { status: 409 },
      );
    }

    await db.$transaction([
      db.stockMovement.deleteMany({ where: { variant: { productId: id } } }),
      db.variant.deleteMany({ where: { productId: id } }),
      db.product.delete({ where: { id } }),
    ]);

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
