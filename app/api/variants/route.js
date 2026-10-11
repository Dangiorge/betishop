import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function GET() {
  try {
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    const variants = await db.variant.findMany({
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const flat = variants.map((v) => ({
      id: v.id,
      label: `${v.product.name}${[v.color, v.size].filter(Boolean).length ? " · " + [v.color, v.size].filter(Boolean).join(" / ") : ""}`,
      costPrice: v.costPrice,
    }));

    return NextResponse.json(flat);
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
