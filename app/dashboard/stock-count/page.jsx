import { redirect } from "next/navigation";
import { getTenantDb } from "@/lib/tenant-db";
import PageHeader from "@/components/ui/page-header";
import StockCountWorkspace from "./stock-count-workspace";

export default async function StockCountPage() {
  const { db, role } = await getTenantDb();
  if (role !== "TENANT_ADMIN") redirect("/dashboard");
  const [stores, variants, counts] = await Promise.all([
    db.store.findMany({ orderBy: { name: "asc" } }),
    db.variant.findMany({ include: { product: { select: { name: true } }, storeStocks: true }, orderBy: { createdAt: "desc" } }),
    db.stockCount.findMany({ where: { storeId: { not: null } }, include: { store: { select: { name: true } }, variant: { include: { product: { select: { name: true } } } }, countedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  const itemOptions = variants.map((variant) => ({ id: variant.id, name: variant.product.name, detail: [variant.color, variant.size].filter(Boolean).join(" / "), stockByStore: Object.fromEntries(variant.storeStocks.map((stock) => [stock.storeId, stock.qty])) }));
  return <div className="max-w-5xl"><PageHeader title="Stock count" subtitle="Compare physical counts with system stock and record corrections." /><StockCountWorkspace stores={stores} variants={itemOptions} counts={counts} /></div>;
}
