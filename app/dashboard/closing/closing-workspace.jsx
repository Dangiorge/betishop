"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

const now = new Date(); const date = now.toISOString().slice(0, 10);
export default function ClosingWorkspace({ periods }) {
  const [startDate, setStartDate] = useState(`${date.slice(0, 7)}-01`); const [endDate, setEndDate] = useState(date); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    const response = await fetch("/api/closing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startDate, endDate }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setError(data.error || "Could not calculate closing"); return; }
    router.refresh();
  }
  return <>
    <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="text-sm">Start date<Input className="mt-1" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label><label className="text-sm">End date<Input className="mt-1" type="date" min={startDate} required value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label><Button disabled={busy}>{busy ? "Calculating…" : "Calculate closing"}</Button>{error && <p role="alert" className="text-sm text-red-700 sm:col-span-3">{error}</p>}</form>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><h2 className="border-b border-slate-100 px-4 py-3 font-semibold">Saved periods</h2>{periods.length ? <div className="divide-y divide-slate-100">{periods.map((period) => <article key={period.id} className="p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-medium">{new Date(period.startDate).toLocaleDateString()} – {new Date(period.endDate).toLocaleDateString()}</p><time className="text-sm text-slate-500">Saved {new Date(period.createdAt).toLocaleString()}</time></div><div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5"><Metric label="Sales" value={period.totalSales} /><Metric label="Cost of goods" value={period.costOfGoods} /><Metric label="Expenses" value={period.totalExpenses} /><Metric label="Commission" value={period.totalCommissions} /><Metric label="Net result" value={period.netResult} /></div></article>)}</div> : <p className="p-6 text-center text-sm text-slate-500">No closing periods saved yet.</p>}</section>
  </>;
}
function Metric({ label, value }) { return <div><p className="text-slate-500">{label}</p><p className="font-semibold">ETB {Number(value).toLocaleString()}</p></div>; }
