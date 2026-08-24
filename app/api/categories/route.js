import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function GET() {
  try {
    const { db } = await getTenantDb();
    const categories = await db.category.findMany({
      include: { _count: { select: { products: true, children: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
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
        { error: "Only the shop admin can add categories" },
        { status: 403 },
      );
    }

    const { name, parentId } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (parentId) {
      const parent = await db.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 400 },
        );
      }
    }

    const category = await db.category.create({
      data: { name: name.trim(), parentId: parentId || null },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    if (e.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "A category with that name already exists under this parent" },
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
