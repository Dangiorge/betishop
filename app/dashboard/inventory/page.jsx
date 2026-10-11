import { redirect } from "next/navigation";
import { getTenantDb } from "@/lib/tenant-db";
import { isSalesRole } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";

export default async function InventoryPage() {
  const { db, session, role } = await getTenantDb();
  if (!isSalesRole(role) && role !== "TENANT_ADMIN") redirect("/dashboard");
  const rows = await db.gRN.findMany({
    where: isSalesRole(role) ? { storeId: session.user.assignedStoreId ?? "" } : {},
    include: { store: { select: { name: true } }, supplier: { select: { name: true } }, items: { include: { variant: { include: { product: { select: { name: true } } } } } } },
    orderBy: { createdAt: "desc" }, take: 100,
  });
  return <div><PageHeader title="New inventory" subtitle="Recently received stock for your store." />
    <div className="space-y-3">{rows.map((row) => <article key={row.id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold">Received at {row.store.name}</p><p className="text-xs text-slate-500">{row.supplier?.name || "Supplier not recorded"}{row.referenceNo ? ` · Ref ${row.referenceNo}` : ""}</p></div><time className="text-sm text-slate-500">{new Date(row.createdAt).toLocaleString()}</time></div><ul className="mt-3 divide-y divide-slate-100">{row.items.map((item) => <li key={item.id} className="flex justify-between gap-3 py-2 text-sm"><span>{item.variant.product.name}{[item.variant.color, item.variant.size].filter(Boolean).length ? ` · ${[item.variant.color, item.variant.size].filter(Boolean).join(" / ")}` : ""}</span><strong>+{item.qty} units</strong></li>)}</ul></article>)}{!rows.length && <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">No recently received inventory for this store.</p>}</div>
  </div>;
}
