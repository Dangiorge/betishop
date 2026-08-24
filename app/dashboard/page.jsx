import { getTenantDb } from "@/lib/tenant-db";
import PageHeader from "@/components/ui/page-header";
import Card from "@/components/ui/card";

export default async function DashboardPage() {
  const { db, session } = await getTenantDb();

  const [productCount, stockRows, salesThisMonth, expensesThisMonth] =
    await Promise.all([
      db.product.count(),
      db.storeStock.groupBy({
        by: ["variantId"],
        _sum: { qty: true },
      }),
      db.sale.aggregate({
        _sum: { qty: true },
        where: { createdAt: { gte: startOfMonth() } },
      }),
      db.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: startOfMonth() } },
      }),
    ]);

  const lowStockCount = stockRows.filter((r) => (r._sum.qty ?? 0) <= 3).length;

  return (
    <div>
      <PageHeader
        title={`Welcome back${session.user.name ? `, ${session.user.name}` : ""}`}
        subtitle="Here's how your shop is doing this month"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Products" value={productCount} />
        <StatCard
          label="Low stock items (≤3, total across stores)"
          value={lowStockCount}
          warn={lowStockCount > 0}
        />
        <StatCard
          label="Units sold this month"
          value={salesThisMonth._sum.qty ?? 0}
        />
        <StatCard
          label="Expenses this month"
          value={`$${Number(expensesThisMonth._sum.amount ?? 0).toFixed(2)}`}
        />
      </div>
    </div>
  );
}

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function StatCard({ label, value, warn }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className={`text-2xl font-semibold mt-1 ${warn ? "text-red-600" : "text-slate-900"}`}>
        {value}
      </p>
    </Card>
  );
}
