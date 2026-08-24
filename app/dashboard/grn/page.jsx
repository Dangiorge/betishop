import { getTenantDb } from "@/lib/tenant-db";
import GRNForm from "./grn-form";
import PageHeader from "@/components/ui/page-header";
import Card from "@/components/ui/card";

export default async function GRNPage() {
  const { db } = await getTenantDb();

  const [grns, stores, suppliers, variants] = await Promise.all([
    db.gRN.findMany({
      include: {
        store: true,
        supplier: true,
        receivedBy: { select: { name: true } },
        items: {
          include: {
            variant: { include: { product: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.store.findMany({ where: { allowGRN: true }, orderBy: { name: "asc" } }),
    db.supplier.findMany({ orderBy: { name: "asc" } }),
    db.variant.findMany({
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const variantOptions = variants.map((v) => ({
    id: v.id,
    label: `${v.product.name}${[v.color, v.size].filter(Boolean).length ? " · " + [v.color, v.size].filter(Boolean).join(" / ") : ""}`,
  }));

  return (
    <div>
      <PageHeader
        title="GRN — Goods Received"
        subtitle="Record stock received into a store from a supplier"
      />

      <div className="mb-6">
        <GRNForm
          stores={stores}
          suppliers={suppliers}
          variants={variantOptions}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-medium text-slate-700">Recent GRNs</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {grns.length === 0 && (
            <p className="p-6 text-sm text-slate-400 text-center">
              No GRNs recorded yet.
            </p>
          )}
          {grns.map((g) => {
            const total = g.items.reduce(
              (sum, i) => sum + i.qty * Number(i.unitCost),
              0,
            );
            return (
              <div key={g.id} className="p-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {g.store.name}
                      {g.supplier && ` · ${g.supplier.name}`}
                      {g.referenceNo && ` · Ref: ${g.referenceNo}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Received by {g.receivedBy.name} ·{" "}
                      {new Date(g.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <ul className="mt-2 text-xs text-slate-500 space-y-0.5">
                  {g.items.map((i) => (
                    <li key={i.id}>
                      {i.variant.product.name}
                      {[i.variant.color, i.variant.size].filter(Boolean).length
                        ? ` (${[i.variant.color, i.variant.size].filter(Boolean).join(" / ")})`
                        : ""}
                      {" — "}
                      {i.qty} @ ${Number(i.unitCost).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
