import { redirect } from "next/navigation";
import { getTenantDb } from "@/lib/tenant-db";
import PageHeader from "@/components/ui/page-header";
import ClosingWorkspace from "./closing-workspace";

export default async function ClosingPage() {
  const { db, role } = await getTenantDb();
  if (role !== "TENANT_ADMIN") redirect("/dashboard");
  const periods = await db.closingPeriod.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return <div className="max-w-4xl"><PageHeader title="Monthly closing" subtitle="Choose a date range to snapshot sales, expenses, commissions, and net result." /><ClosingWorkspace periods={periods} /></div>;
}
