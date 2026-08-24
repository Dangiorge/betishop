import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") {
      return NextResponse.json(
        { error: "Only the shop admin can edit categories" },
        { status: 403 },
      );
    }

    const { name, parentId } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (parentId === id) {
      return NextResponse.json(
        { error: "A category cannot be its own parent" },
        { status: 400 },
      );
    }

    if (parentId) {
      // Prevent creating a cycle: parent can't be a descendant of this category
      const descendantIds = await getDescendantIds(db, id);
      if (descendantIds.includes(parentId)) {
        return NextResponse.json(
          { error: "Cannot move a category under its own subcategory" },
          { status: 400 },
        );
      }
    }

    const category = await db.category.update({
      where: { id },
      data: { name: name.trim(), parentId: parentId || null },
    });

    return NextResponse.json(category);
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

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") {
      return NextResponse.json(
        { error: "Only the shop admin can delete categories" },
        { status: 403 },
      );
    }

    const category = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: ${category._count.products} product(s) are assigned to this category`,
        },
        { status: 409 },
      );
    }

    if (category._count.children > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete: this category has subcategories. Delete or move them first",
        },
        { status: 409 },
      );
    }

    await db.category.delete({ where: { id } });
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

// Walks the tree to find every descendant of a category, used to block cycles on move
async function getDescendantIds(db, categoryId) {
  const ids = [];
  let frontier = [categoryId];
  while (frontier.length > 0) {
    const children = await db.category.findMany({
      where: { parentId: { in: frontier } },
      select: { id: true },
    });
    const childIds = children.map((c) => c.id);
    ids.push(...childIds);
    frontier = childIds;
  }
  return ids;
}
