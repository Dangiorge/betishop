"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function SalesWorkspace({ stores, variants, accounts, assignedStoreId }) {
  const [storeId, setStoreId] = useState(assignedStoreId || stores[0]?.id || "");
  const [cart, setCart] = useState([]);
  const [variantId, setVariantId] = useState("");
  const [qty, setQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [bankAccountId, setBankAccountId] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const available = useMemo(() => variants.filter((v) => (v.stockByStore[storeId] || 0) > 0), [variants, storeId]);
  const selected = variants.find((v) => v.id === variantId);

  function addItem() {
    if (!selected || !qty || Number(qty) < 1) return;
    const line = { variantId, qty: Number(qty), price: selected.price, name: selected.name, detail: [selected.color, selected.size].filter(Boolean).join(" / "), stock: selected.stockByStore[storeId] || 0 };
    const existing = cart.find((item) => item.variantId === variantId);
    if (existing) setCart((items) => items.map((item) => item.variantId === variantId ? { ...item, qty: item.qty + line.qty } : item));
    else setCart((items) => [...items, line]);
    setVariantId(""); setQty(1);
  }

  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    const response = await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storeId, items: cart.map(({ variantId, qty, price }) => ({ variantId, qty, price })), paymentMethod, bankAccountId, transactionReference: reference }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setError(data.error || "Could not record the sale"); return; }
    setCart([]); setReference(""); router.refresh();
  }

  return <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
    <h2 className="text-base font-semibold">New sale</h2>
    {stores.length === 0 ? <p className="mt-3 text-sm text-amber-800">No sales-enabled store is assigned. Ask the owner to assign your account to a store.</p> : <>
      {!assignedStoreId && <label className="mt-4 block text-sm font-medium">Store<select className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" value={storeId} onChange={(e) => { setStoreId(e.target.value); setCart([]); }} required>{stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_100px_auto]">
        <select className="min-w-0 rounded-lg border border-slate-200 bg-white p-2.5 text-sm" value={variantId} onChange={(e) => setVariantId(e.target.value)}><option value="">Select item · available stock</option>{available.map((v) => <option key={v.id} value={v.id}>{v.name}{v.color || v.size ? ` · ${[v.color, v.size].filter(Boolean).join(" / ")}` : ""} · {v.stockByStore[storeId]} in stock · ETB {v.price.toLocaleString()}</option>)}</select>
        <Input aria-label="Quantity" type="number" min="1" max={selected?.stockByStore[storeId] || undefined} value={qty} onChange={(e) => setQty(e.target.value)} />
        <Button type="button" variant="secondary" onClick={addItem} disabled={!selected}>Add item</Button>
      </div>
      {cart.length > 0 && <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-100">{cart.map((line) => <div key={line.variantId} className="flex items-center justify-between gap-3 p-3 text-sm"><div className="min-w-0"><p className="truncate font-medium">{line.name}{line.detail ? ` · ${line.detail}` : ""}</p><p className="text-xs text-slate-500">{line.qty} × ETB {line.price.toLocaleString()} (stock {line.stock})</p></div><div className="flex items-center gap-2"><strong>ETB {(line.qty * line.price).toLocaleString()}</strong><button type="button" aria-label="Remove item" className="rounded px-2 py-1 text-red-700 hover:bg-red-50" onClick={() => setCart((items) => items.filter((i) => i.variantId !== line.variantId))}>×</button></div></div>)}</div>}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">Payment method<select className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}><option value="CASH">Cash</option><option value="BANK">Bank transfer</option><option value="MOBILE_MONEY">Mobile money</option><option value="OTHER">Other</option></select></label>
        {paymentMethod === "BANK" && <label className="text-sm font-medium">Bank account<select className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} required><option value="">Select account</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.bankName} · {a.name}</option>)}</select></label>}
        {paymentMethod !== "CASH" && <label className="text-sm font-medium">Payment reference (optional)<Input className="mt-1" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Transaction ID" /></label>}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">Total ETB {cart.reduce((s, item) => s + item.qty * item.price, 0).toLocaleString()}</p><Button type="submit" disabled={busy || !cart.length || !storeId}>{busy ? "Saving sale…" : "Complete sale"}</Button></div>
    </>}
  </form>;
}
