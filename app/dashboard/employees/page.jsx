import { redirect } from "next/navigation";
import { getTenantDb } from "@/lib/tenant-db";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/page-header";
import EmployeesWorkspace from "./employees-workspace";

export default async function EmployeesPage() {
  const { db, tenantId, role } = await getTenantDb();
  if (role !== "TENANT_ADMIN") redirect("/dashboard");
  const [stores, employees] = await Promise.all([
    db.store.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { tenantId, role: "SALES_PERSON" }, include: { assignedStore: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
  ]);
  return <div className="max-w-4xl"><PageHeader title="Sales staff" subtitle="Create sales accounts and assign each person to a store." /><EmployeesWorkspace stores={stores} employees={employees.map(({ hashedPassword, ...e }) => e)} /></div>;
}
