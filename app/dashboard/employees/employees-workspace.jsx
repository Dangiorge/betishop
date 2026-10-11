"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function EmployeesWorkspace({ stores, employees }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", storeId: stores[0]?.id || "", commissionRate: "" });
  const router = useRouter();
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    const response = await fetch("/api/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setError(data.error || "Could not add staff account"); return; }
    setForm((f) => ({ ...f, name: "", email: "", password: "", commissionRate: "" })); router.refresh();
  }
  return <>
    <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 sm:p-5">
      <h2 className="font-semibold sm:col-span-2">Add sales person</h2>
      <Input placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input type="email" placeholder="Email address" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input type="password" placeholder="Temporary password (8+ characters)" minLength={8} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <select aria-label="Assigned store" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" required value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })}><option value="">Assign to store</option>{stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <Input type="number" min="0" max="100" step="0.01" placeholder="Commission % (optional)" value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} />
      {error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}
      <Button className="sm:col-span-2 sm:justify-self-start" disabled={busy || !stores.length}>{busy ? "Creating…" : "Create sales account"}</Button>
      {!stores.length && <p className="text-sm text-amber-800 sm:col-span-2">Add a store before creating a sales account.</p>}
    </form>
    <div className="space-y-3">{employees.map((person) => <article key={person.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4"><div><p className="font-medium">{person.name}</p><p className="text-sm text-slate-500">{person.email}</p></div><div className="text-right text-sm"><p>{person.assignedStore?.name || "No store"}</p><p className="text-slate-500">{person.commissionRate ? `${person.commissionRate}% commission` : "Sales staff"}</p></div></article>)}{!employees.length && <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">No sales accounts yet.</p>}</div>
  </>;
}
