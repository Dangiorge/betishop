import { redirect } from "next/navigation";
import { getTenantDb } from "@/lib/tenant-db";
import PageHeader from "@/components/ui/page-header";
import ExpensesWorkspace from "./expenses-workspace";

export default async function ExpensesPage() {
  const { db, role } = await getTenantDb();
  if (role !== "TENANT_ADMIN") redirect("/dashboard");
  const [expenses, accounts] = await Promise.all([
    db.expense.findMany({ include: { bankAccount: { select: { name: true, bankName: true } } }, orderBy: { date: "desc" }, take: 200 }),
    db.bankAccount.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  return <div className="max-w-5xl"><PageHeader title="Expenses" subtitle="Record rent, transport, salaries, and other shop costs." /><ExpensesWorkspace expenses={expenses} accounts={accounts} /></div>;
}
