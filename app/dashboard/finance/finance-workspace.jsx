"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function FinanceWorkspace({ accounts }) {
  const [form, setForm] = useState({ name: "", bankName: "", accountLast4: "", openingBalance: "0" });
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    const response = await fetch("/api/bank-accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setError(data.error || "Could not save account"); return; }
    setForm({ name: "", bankName: "", accountLast4: "", openingBalance: "0" }); router.refresh();
  }
  return <>
    <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 sm:p-5">
      <h2 className="font-semibold sm:col-span-2">Add bank account</h2>
      <Input placeholder="Account label (e.g. Main account)" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input placeholder="Bank name" required value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
      <Input inputMode="numeric" maxLength={4} placeholder="Last 4 digits (optional)" value={form.accountLast4} onChange={(e) => setForm({ ...form, accountLast4: e.target.value })} />
      <Input type="number" step="0.01" placeholder="Opening balance (ETB)" value={form.openingBalance} onChange={(e) => setForm({ ...form, openingBalance: e.target.value })} />
      {error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}
      <Button disabled={busy} className="sm:col-span-2 sm:justify-self-start">{busy ? "Saving…" : "Add account"}</Button>
    </form>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{accounts.map((account) => <article key={account.id} className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex justify-between gap-3"><div><p className="font-semibold">{account.name}</p><p className="text-sm text-slate-500">{account.bankName}{account.accountLast4 ? ` · •••• ${account.accountLast4}` : ""}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">Active</span></div>
      <p className="mt-5 text-xs uppercase tracking-wide text-slate-500">Calculated balance</p><p className="text-2xl font-semibold">ETB {account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-sm"><div><p className="text-slate-500">Sales received</p><p>ETB {account.incoming.toLocaleString()}</p></div><div><p className="text-slate-500">Expenses paid</p><p>ETB {account.outgoing.toLocaleString()}</p></div></div>
      <p className="mt-3 text-xs text-slate-400">Opening balance plus recorded bank sales, less recorded bank expenses.</p>
    </article>)}{!accounts.length && <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 sm:col-span-2">No bank accounts yet. Add one so bank transfer sales and bank paid expenses can be tracked.</p>}</div>
  </>;
}
