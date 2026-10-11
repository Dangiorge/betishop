import { getTenantDb } from "@/lib/tenant-db";
import { isSalesRole } from "@/lib/permissions";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/ui/page-header";
import Card from "@/components/ui/card";

export default async function DashboardPage() {
  const { db, session } = await getTenantDb();
  const salesperson = isSalesRole(session.user.role);
  const [productCount, stockRows, sales, expenses] = await Promise.all([
    db.product.count(),
    db.storeStock.groupBy({ by: ["variantId"], _sum: { qty: true }, where: salesperson ? { storeId: session.user.assignedStoreId ?? "" } : {} }),
    db.sale.findMany({ select: { qty: true, priceAtSale: true, costAtSale: true, variant: { select: { costPrice: true } }, employee: { select: { commissionRate: true } } }, where: { createdAt: { gte: startOfMonth() }, ...(salesperson ? { employeeId: session.user.id } : {}) } }),
    salesperson ? Promise.resolve(null) : db.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: startOfMonth() } } }),
  ]);
  const lowStockCount = stockRows.filter((r) => (r._sum.qty ?? 0) <= 3).length;
  const unitsSold = sales.reduce((sum, sale) => sum + sale.qty, 0);
  const salesValue = sales.reduce((sum, sale) => sum + Number(sale.priceAtSale) * sale.qty, 0);
  const costOfGoods = sales.reduce((sum, sale) => sum + Number(sale.costAtSale ?? sale.variant.costPrice) * sale.qty, 0);
  const commissions = sales.reduce((sum, sale) => sum + Number(sale.priceAtSale) * sale.qty * Number(sale.employee.commissionRate ?? 0) / 100, 0);
  return <div>
    <PageHeader title={`Welcome back${session.user.name ? `, ${session.user.name}` : ""}`} subtitle={salesperson ? "Your sales and available stock this month" : "Here's how your shop is doing this month"} />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Products" value={productCount} />
      <StatCard label={salesperson ? "Low stock in your store" : "Low stock items across stores"} value={lowStockCount} warn={lowStockCount > 0} />
      <StatCard label={salesperson ? "Your units sold this month" : "Units sold this month"} value={unitsSold} />
      <StatCard label={salesperson ? "Your sales this month" : "Sales revenue this month"} value={formatMoney(salesValue)} />
      {!salesperson && <StatCard label="Expenses this month" value={formatMoney(expenses?._sum.amount)} />}
      {!salesperson && <StatCard label="Net after costs and commissions" value={formatMoney(salesValue - costOfGoods - Number(expenses?._sum.amount ?? 0) - commissions)} />}
    </div>
  </div>;
}

function startOfMonth() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); }
function StatCard({ label, value, warn }) {
  return <Card className="p-5"><p className="text-sm text-slate-500">{label}</p><p className={`mt-1 text-2xl font-semibold ${warn ? "text-red-600" : "text-slate-900"}`}>{value}</p></Card>;
}
