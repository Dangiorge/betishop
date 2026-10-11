"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";

export default function StockCountWorkspace({ stores, variants, counts }) {
  const [storeId, setStoreId] = useState(stores[0]?.id || ""); const [selected, setSelected] = useState(""); const [items, setItems] = useState([]); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  function changeStore(id) { setStoreId(id); setItems([]); }
  function addItem() {
    const variant = variants.find((v) => v.id === selected);
    if (!variant || items.some((item) => item.variantId === selected)) return;
    setItems((list) => [...list, { variantId: variant.id, name: variant.name, detail: variant.detail, systemQty: variant.stockByStore[storeId] || 0, countedQty: String(variant.stockByStore[storeId] || 0) }]); setSelected("");
  }
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    const response = await fetch("/api/stock-counts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storeId, items: items.map(({ variantId, countedQty }) => ({ variantId, countedQty })) }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setError(data.error || "Could not save stock count"); return; }
    setItems([]); router.refresh();
  }
  return <>
    <form onSubmit={submit} className="mb-7 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className="font-semibold">Start a count</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr_auto]">
        <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" value={storeId} onChange={(e) => changeStore(e.target.value)} required><option value="">Select store</option>{stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select>
        <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" value={selected} onChange={(e) => setSelected(e.target.value)}><option value="">Select item to count</option>{variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.name}{variant.detail ? ` · ${variant.detail}` : ""} · system {variant.stockByStore[storeId] || 0}</option>)}</select>
        <Button type="button" variant="secondary" onClick={addItem} disabled={!selected}>Add item</Button>
      </div>
      {items.length > 0 && <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-100">{items.map((item) => <div key={item.variantId} className="flex flex-wrap items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="font-medium">{item.name}{item.detail ? ` · ${item.detail}` : ""}</p><p className="text-xs text-slate-500">System quantity: {item.systemQty}</p></div><div className="flex items-center gap-2"><label className="text-sm">Counted<input aria-label={`Counted quantity for ${item.name}`} type="number" min="0" step="1" className="ml-2 w-24 rounded-lg border border-slate-200 p-2" value={item.countedQty} onChange={(e) => setItems((list) => list.map((row) => row.variantId === item.variantId ? { ...row, countedQty: e.target.value } : row))} /></label><button type="button" className="px-2 text-red-700" onClick={() => setItems((list) => list.filter((row) => row.variantId !== item.variantId))} aria-label="Remove item">×</button></div></div>)}</div>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <Button className="mt-4" disabled={busy || !storeId || !items.length}>{busy ? "Saving count…" : "Save count and correct stock"}</Button>
    </form>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><h2 className="border-b border-slate-100 px-4 py-3 font-semibold">Recent counts</h2>{counts.length ? <div className="divide-y divide-slate-100">{counts.map((count) => <article key={count.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"><div><p className="font-medium">{count.variant.product.name}{[count.variant.color, count.variant.size].filter(Boolean).length ? ` · ${[count.variant.color, count.variant.size].filter(Boolean).join(" / ")}` : ""}</p><p className="text-slate-500">{count.store?.name} · counted by {count.countedBy.name}</p></div><p>System {count.systemQty} → counted {count.countedQty} <strong className={count.variance ? "text-amber-700" : "text-emerald-700"}>({count.variance > 0 ? "+" : ""}{count.variance})</strong></p></article>)}</div> : <p className="p-6 text-center text-sm text-slate-500">No stock counts recorded yet.</p>}</section>
  </>;
}
