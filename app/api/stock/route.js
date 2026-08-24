import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function GET() {
  try {
    const { db } = await getTenantDb();

    const [variants, stores, storeStocks] = await Promise.all([
      db.variant.findMany({
        include: { product: { select: { name: true, imageUrl: true } } },
        orderBy: { createdAt: "desc" },
      }),
      db.store.findMany({ orderBy: { name: "asc" } }),
      db.storeStock.findMany(),
    ]);

    return NextResponse.json({ variants, stores, storeStocks });
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
