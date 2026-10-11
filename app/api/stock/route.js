import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function GET() {
  try {
    const { db, session, role } = await getTenantDb();
    const salesperson = role === "SALES_PERSON" || role === "EMPLOYEE";

    const [variants, stores, storeStocks] = await Promise.all([
      db.variant.findMany({
        include: { product: { select: { name: true, imageUrl: true } } },
        orderBy: { createdAt: "desc" },
      }),
      db.store.findMany({ where: salesperson ? { id: session.user.assignedStoreId ?? "" } : {}, orderBy: { name: "asc" } }),
      db.storeStock.findMany({ where: salesperson ? { storeId: session.user.assignedStoreId ?? "" } : {} }),
    ]);

    const safeVariants = salesperson ? variants.map(({ costPrice, ...variant }) => variant) : variants;
    return NextResponse.json({ variants: safeVariants, stores, storeStocks });
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
