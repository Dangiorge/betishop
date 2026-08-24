import { getTenantDb } from "@/lib/tenant-db";
import PageHeader from "@/components/ui/page-header";
import Card from "@/components/ui/card";
import Link from "next/link";

export default async function StockPage() {
  const { db } = await getTenantDb();

  const [variants, stores, storeStocks] = await Promise.all([
    db.variant.findMany({
      include: {
        product: { select: { id: true, name: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.store.findMany({ orderBy: { name: "asc" } }),
    db.storeStock.findMany(),
  ]);

  const stockMap = new Map(); // `${variantId}:${storeId}` -> qty
  for (const s of storeStocks) {
    stockMap.set(`${s.variantId}:${s.storeId}`, s.qty);
  }

  return (
    <div>
      <PageHeader
        title="Stock Overview"
        subtitle="Live stock levels for every item, by store"
      />

      {stores.length === 0 ? (
        <Card className="p-6 text-sm text-slate-500">
          No stores set up yet —{" "}
          <Link
            href="/dashboard/stores"
            className="text-blue-900 font-medium hover:underline">
            add a store
          </Link>{" "}
          first, then receive stock via GRN.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="p-4">Item</th>
                  {stores.map((s) => (
                    <th key={s.id} className="p-4 text-right">
                      {s.name}
                    </th>
                  ))}
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {variants.map((v) => {
                  const label =
                    [v.color, v.size].filter(Boolean).join(" / ") || "Default";
                  const rowTotal = stores.reduce(
                    (sum, s) => sum + (stockMap.get(`${v.id}:${s.id}`) ?? 0),
                    0,
                  );
                  const low = rowTotal <= 3;
                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <Link
                          href={`/dashboard/products/${v.product.id}`}
                          className="font-medium text-slate-900 hover:underline">
                          {v.product.name}
                        </Link>
                        <p className="text-xs text-slate-500">{label}</p>
                      </td>
                      {stores.map((s) => {
                        const qty = stockMap.get(`${v.id}:${s.id}`) ?? 0;
                        return (
                          <td
                            key={s.id}
                            className="p-4 text-right text-slate-600">
                            {qty}
                          </td>
                        );
                      })}
                      <td
                        className={`p-4 text-right font-medium ${low ? "text-red-600" : "text-slate-900"}`}>
                        {rowTotal}
                      </td>
                    </tr>
                  );
                })}
                {variants.length === 0 && (
                  <tr>
                    <td
                      colSpan={stores.length + 2}
                      className="p-8 text-center text-slate-400">
                      No products yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
