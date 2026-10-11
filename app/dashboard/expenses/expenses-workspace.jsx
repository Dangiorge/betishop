"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

const today = new Date().toISOString().slice(0, 10);
export default function ExpensesWorkspace({ expenses, accounts }) {
  const [form, setForm] = useState({ category: "TRANSPORT", customCategory: "", amount: "", date: today, note: "", paymentMethod: "CASH", bankAccountId: "" });
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    const response = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) { setError(result.error || "Could not record expense"); return; }
    setForm({ ...form, amount: "", note: "", customCategory: "" }); router.refresh();
  }
  return <>
    <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 sm:p-5">
      <h2 className="font-semibold sm:col-span-2">Add expense</h2>
      <label className="text-sm">Expense type<select className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="TRANSPORT">Transport</option><option value="RENT">Rent</option><option value="SALARY">Salary</option><option value="OTHER">Other / custom</option></select></label>
      {form.category === "OTHER" && <Input placeholder="Expense type (e.g. electricity)" required value={form.customCategory} onChange={(e) => setForm({ ...form, customCategory: e.target.value })} />}
      <Input aria-label="Amount in Ethiopian birr" type="number" min="0.01" step="0.01" placeholder="Amount (ETB)" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
      <Input aria-label="Expense date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      <label className="text-sm">Paid from<select className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}><option value="CASH">Cash</option><option value="BANK">Bank account</option><option value="MOBILE_MONEY">Mobile money</option><option value="OTHER">Other</option></select></label>
      {form.paymentMethod === "BANK" && <label className="text-sm">Bank account<select required className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5" value={form.bankAccountId} onChange={(e) => setForm({ ...form, bankAccountId: e.target.value })}><option value="">Choose account</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.bankName} · {a.name}</option>)}</select></label>}
      <Input className="sm:col-span-2" placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
      {error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}
      <Button disabled={busy} className="sm:col-span-2 sm:justify-self-start">{busy ? "Saving…" : "Save expense"}</Button>
    </form>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <h2 className="border-b border-slate-100 px-4 py-3 font-semibold">Recent expenses</h2>
      {expenses.length ? <div className="divide-y divide-slate-100">{expenses.map((expense) => <article key={expense.id} className="flex flex-wrap items-start justify-between gap-2 p-4"><div><p className="font-medium">{expense.category === "OTHER" ? expense.customCategory : expense.category[0] + expense.category.slice(1).toLowerCase()}</p><p className="text-sm text-slate-500">{new Date(expense.date).toLocaleDateString()} · {expense.paymentMethod.replace("_", " ")}{expense.bankAccount ? ` · ${expense.bankAccount.bankName} (${expense.bankAccount.name})` : ""}</p>{expense.note && <p className="mt-1 text-sm text-slate-600">{expense.note}</p>}</div><strong>ETB {Number(expense.amount).toLocaleString()}</strong></article>)}</div> : <p className="p-6 text-center text-sm text-slate-500">No expenses recorded yet.</p>}
    </section>
  </>;
}
