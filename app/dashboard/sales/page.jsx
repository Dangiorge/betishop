import { getTenantDb } from "@/lib/tenant-db";
import { isSalesRole } from "@/lib/permissions";
import SalesWorkspace from "./sales-workspace";
import PageHeader from "@/components/ui/page-header";

export default async function SalesPage() {
  const { db, session, role } = await getTenantDb();
  const salesperson = isSalesRole(role);
  const [stores, variants, accounts, batches] = await Promise.all([
    db.store.findMany({ where: { allowSales: true, ...(salesperson ? { id: session.user.assignedStoreId ?? "" } : {}) }, orderBy: { name: "asc" } }),
    db.variant.findMany({ include: { product: { select: { name: true, imageUrl: true, category: { select: { name: true } } } }, storeStocks: salesperson ? { where: { storeId: session.user.assignedStoreId ?? "" } } : true }, orderBy: { createdAt: "desc" } }),
    db.bankAccount.findMany({ where: { active: true }, select: { id: true, name: true, bankName: true }, orderBy: { name: "asc" } }),
    db.saleBatch.findMany({
      where: salesperson ? { employeeId: session.user.id } : {},
      include: { store: { select: { name: true } }, employee: { select: { name: true } }, bankAccount: { select: { name: true, bankName: true } }, items: { include: { variant: { include: { product: { select: { name: true } } } } } } },
      orderBy: { createdAt: "desc" }, take: 50,
    }),
  ]);
  const payload = variants.map((v) => ({
    id: v.id, name: v.product.name, imageUrl: v.product.imageUrl, category: v.product.category.name, color: v.color, size: v.size,
    price: Number(v.sellPrice), stockByStore: Object.fromEntries(v.storeStocks.map((s) => [s.storeId, s.qty])),
  }));
  return <div>
    <PageHeader title="Sales" subtitle="Record a sale, collect payment, and update store stock." />
    {role === "TENANT_ADMIN" || salesperson ? <SalesWorkspace stores={stores} variants={payload} accounts={accounts} assignedStoreId={session.user.assignedStoreId} /> : <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Sales access is limited to shop owners and sales staff.</p>}
    <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3 font-semibold">Recent receipts</div>
      {batches.length ? <div className="divide-y divide-slate-100">{batches.map((b) => <article key={b.id} className="p-4">
        <div className="flex flex-wrap justify-between gap-2 text-sm"><div><strong>{b.store.name}</strong><span className="text-slate-500"> · {b.employee.name}</span></div><time className="text-slate-500">{new Date(b.createdAt).toLocaleString()}</time></div>
        <p className="mt-1 text-xs text-slate-500">{b.paymentMethod.replace("_", " ")}{b.bankAccount ? ` · ${b.bankAccount.bankName} (${b.bankAccount.name})` : ""}{b.transactionReference ? ` · Ref ${b.transactionReference}` : ""}</p>
        <ul className="mt-2 text-sm">{b.items.map((line) => <li key={line.id} className="flex justify-between gap-3"><span>{line.variant.product.name} {[line.variant.color, line.variant.size].filter(Boolean).join(" / ")} × {line.qty}</span><span>ETB {(Number(line.priceAtSale) * line.qty).toLocaleString()}</span></li>)}</ul>
        <p className="mt-2 text-right text-sm font-semibold">Total ETB {b.items.reduce((s, l) => s + Number(l.priceAtSale) * l.qty, 0).toLocaleString()}</p>
      </article>)}</div> : <p className="p-6 text-center text-sm text-slate-500">No sales recorded yet.</p>}
    </section>
  </div>;
}
