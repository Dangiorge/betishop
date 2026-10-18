import { redirect } from "next/navigation";
import { getTenantDb } from "@/lib/tenant-db";
import PageHeader from "@/components/ui/page-header";
import EmployeesWorkspace from "./employees-workspace";

export default async function EmployeesPage() {
  const { db, tenantId, role } = await getTenantDb();
  if (role !== "TENANT_ADMIN") redirect("/dashboard");
  const [stores, employees] = await Promise.all([
    db.store.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({
      where: { role: "SALES_PERSON" },
      select: {
        id: true,
        name: true,
        email: true,
        assignedStoreId: true,
        baseSalary: true,
        commissionRate: true,
        assignedStore: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const employeeProps = employees.map((employee) => ({
    ...employee,
    baseSalary: employee.baseSalary === null ? null : Number(employee.baseSalary),
    commissionRate: employee.commissionRate === null ? null : Number(employee.commissionRate),
  }));

  return <div className="max-w-4xl"><PageHeader title="Sales staff" subtitle="Create sales accounts and assign each person to a store." /><EmployeesWorkspace stores={stores} employees={employeeProps} /></div>;
}
