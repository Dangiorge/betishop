import { redirect } from "next/navigation";
import { getTenantDb } from "@/lib/tenant-db";
import PageHeader from "@/components/ui/page-header";
import FinanceWorkspace from "./finance-workspace";

export default async function FinancePage() {
  const { db, role } = await getTenantDb();
  if (role !== "TENANT_ADMIN") redirect("/dashboard");
  const accounts = await db.bankAccount.findMany({ include: { saleBatches: { include: { items: true } }, expenses: true }, orderBy: { createdAt: "desc" } });
  const summary = accounts.map((account) => {
    const incoming = account.saleBatches.reduce((sum, batch) => sum + batch.items.reduce((s, item) => s + Number(item.priceAtSale) * item.qty, 0), 0);
    const outgoing = account.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    return { id: account.id, name: account.name, bankName: account.bankName, accountLast4: account.accountLast4, openingBalance: Number(account.openingBalance), incoming, outgoing, balance: Number(account.openingBalance) + incoming - outgoing };
  });
  return <div className="max-w-5xl"><PageHeader title="Bank accounts" subtitle="Track bank transfers received from sales and expenses paid from each account." /><FinanceWorkspace accounts={summary} /></div>;
}
