import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/page-header";
import Card from "@/components/ui/card";

export default async function AdminDashboard() {
  const tenants = await prisma.tenant.findMany({
    where: { slug: { not: "platform" } },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { users: true, products: true, sales: true, expenses: true },
      },
    },
  });

  const totalShops = tenants.length;
  const totalEmployees = tenants.reduce((sum, t) => sum + t._count.users, 0);
  const totalSales = tenants.reduce((sum, t) => sum + t._count.sales, 0);

  return (
    <div>
      <PageHeader
        title="All Shops"
        subtitle="Overview of every shop on the platform"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total shops</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {totalShops}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total employees</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {totalEmployees}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total sales recorded</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {totalSales}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="p-4">Shop</th>
                <th className="p-4">Employees</th>
                <th className="p-4">Products</th>
                <th className="p-4">Sales</th>
                <th className="p-4">Expenses logged</th>
                <th className="p-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{t.name}</td>
                  <td className="p-4 text-slate-600">{t._count.users}</td>
                  <td className="p-4 text-slate-600">{t._count.products}</td>
                  <td className="p-4 text-slate-600">{t._count.sales}</td>
                  <td className="p-4 text-slate-600">{t._count.expenses}</td>
                  <td className="p-4 text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No shops yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
