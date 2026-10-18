"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Check,
  Image as ImageIcon,
  Landmark,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/button";

const METHODS = [
  { id: "CASH", label: "Cash", icon: Banknote },
  { id: "BANK", label: "Bank", icon: Landmark },
  { id: "MOBILE_MONEY", label: "Mobile money", icon: Smartphone },
];

const money = (amount) => `ETB ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SalesWorkspace({ stores, variants, accounts, assignedStoreId }) {
  const [storeId, setStoreId] = useState(assignedStoreId || stores[0]?.id || "");
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All items");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [bankAccountId, setBankAccountId] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const available = useMemo(
    () => variants.filter((item) => (item.stockByStore[storeId] || 0) > 0),
    [variants, storeId],
  );
  const categories = useMemo(
    () => ["All items", ...new Set(available.map((item) => item.category).filter(Boolean))],
    [available],
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return available.filter((item) => {
      const matchesCategory = category === "All items" || item.category === category;
      const text = [item.name, item.category, item.color, item.size].filter(Boolean).join(" ").toLocaleLowerCase();
      return matchesCategory && (!query || text.includes(query));
    });
  }, [available, category, search]);

  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  function addItem(item) {
    const stock = item.stockByStore[storeId] || 0;
    setError("");
    const existing = cart.find((line) => line.variantId === item.id);
    if (existing?.qty >= stock) {
      setError(`Only ${stock} in stock for ${item.name}.`);
      return;
    }
    if (existing) {
      setCart((current) => current.map((line) => line.variantId === item.id ? { ...line, qty: line.qty + 1 } : line));
      return;
    }
    setCart((current) => [...current, {
      variantId: item.id,
      name: item.name,
      detail: [item.color, item.size].filter(Boolean).join(" / "),
      imageUrl: item.imageUrl,
      price: item.price,
      stock,
      qty: 1,
    }]);
  }

  function changeQty(variantId, change) {
    setCart((current) => current.flatMap((item) => {
      if (item.variantId !== variantId) return [item];
      const qty = item.qty + change;
      return qty < 1 ? [] : [{ ...item, qty: Math.min(qty, item.stock) }];
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          items: cart.map(({ variantId, qty, price }) => ({ variantId, qty, price })),
          paymentMethod,
          bankAccountId,
          transactionReference: reference,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not record the sale.");
        return;
      }
      setCart([]);
      setReference("");
      setBankAccountId("");
      setSuccess("Sale completed and stock updated.");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!stores.length) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">No sales-enabled store is assigned. Ask the owner to assign your account to a store.</div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-800">Point of sale</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">New sale</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-medium uppercase tracking-wide text-slate-400 sm:block">Selling from</span>
          {assignedStoreId ? (
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{stores.find((store) => store.id === storeId)?.name}</span>
          ) : (
            <select aria-label="Selling from store" className="max-w-[62vw] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800" value={storeId} onChange={(event) => { setStoreId(event.target.value); setCart([]); }}>
              {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="grid min-w-0 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0 p-4 sm:p-6" aria-label="Product catalog">
          <label className="relative block">
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, color, or size" className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-base text-slate-900 outline-none transition focus:border-blue-800 focus:bg-white focus:ring-4 focus:ring-blue-900/10" />
          </label>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Filter by category">
            {categories.map((item) => (
              <button key={item} type="button" onClick={() => setCategory(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition ${category === item ? "bg-blue-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {item}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Tap an item to add it to the sale</span>
            <span>{filtered.length} available</span>
          </div>

          {filtered.length ? (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((item) => {
                const stock = item.stockByStore[storeId] || 0;
                const inCart = cart.find((line) => line.variantId === item.id)?.qty || 0;
                return (
                  <button key={item.id} type="button" onClick={() => addItem(item)} className="group min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-900/15">
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      {item.imageUrl ? <img src={item.imageUrl} alt="" className="size-full object-cover transition duration-300 group-hover:scale-105" /> : <div className="grid size-full place-items-center text-slate-300"><ImageIcon size={32} aria-hidden="true" /></div>}
                      {inCart > 0 && <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-blue-950 text-xs font-bold text-white">{inCart}</span>}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-xs font-medium text-slate-500">{item.category}</p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-0.5 min-h-4 truncate text-xs text-slate-500">{item.color || item.size ? [item.color, item.size].filter(Boolean).join(" · ") : "Standard item"}</p>
                      <div className="mt-3 flex items-end justify-between gap-1">
                        <div className="min-w-0"><p className="truncate text-sm font-bold text-blue-950">{money(item.price)}</p><p className="mt-1 text-[11px] text-slate-500">{stock - inCart} left</p></div>
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-950 group-hover:bg-blue-950 group-hover:text-white"><Plus size={17} aria-hidden="true" /></span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center">
              <ShoppingBag size={30} className="mx-auto text-slate-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No available items found</p>
              <p className="mt-1 text-xs text-slate-500">Try another search or receive stock into this store.</p>
            </div>
          )}
        </section>

        <form onSubmit={submit} className="flex min-w-0 flex-col border-t border-slate-200 bg-slate-50/70 p-4 sm:p-6 xl:border-l xl:border-t-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><ShoppingCart size={19} className="text-blue-950" aria-hidden="true" /><h3 className="font-bold text-slate-900">Current sale</h3></div>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-950">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
          </div>

          <div className="mt-4 min-h-24 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {!cart.length ? (
              <div className="grid min-h-24 place-items-center px-4 text-center text-sm text-slate-400">Choose products to start a sale</div>
            ) : cart.map((item) => (
              <div key={item.variantId} className="flex gap-3 p-3">
                <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">{item.imageUrl ? <img src={item.imageUrl} alt="" className="size-full object-cover" /> : <div className="grid size-full place-items-center text-slate-300"><ShoppingBag size={20} /></div>}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                  {item.detail && <p className="truncate text-xs text-slate-500">{item.detail}</p>}
                  <p className="mt-1 text-xs font-medium text-slate-700">{money(item.price)} each</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => changeQty(item.variantId, -1)} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"><Minus size={14} /></button>
                    <span className="min-w-6 text-center text-sm font-semibold">{item.qty}</span>
                    <button type="button" aria-label={`Increase ${item.name} quantity`} disabled={item.qty >= item.stock} onClick={() => changeQty(item.variantId, 1)} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"><Plus size={14} /></button>
                    <span className="ml-auto text-sm font-bold text-slate-900">{money(item.qty * item.price)}</span>
                    <button type="button" aria-label={`Remove ${item.name}`} onClick={() => changeQty(item.variantId, -item.qty)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payment</p>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => setPaymentMethod(id)} className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition ${paymentMethod === id ? "border-blue-950 bg-blue-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                  <Icon size={15} aria-hidden="true" />{label}
                </button>
              ))}
            </div>
            {paymentMethod === "BANK" && <select aria-label="Bank account receiving payment" required value={bankAccountId} onChange={(event) => setBankAccountId(event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="">Choose bank account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.bankName} · {account.name}</option>)}</select>}
            {paymentMethod !== "CASH" && <input aria-label="Payment reference" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Reference (optional)" className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base outline-none focus:border-blue-800" />}
          </div>

          <div className="mt-5 border-t border-dashed border-slate-300 pt-4">
            <div className="flex items-center justify-between text-sm text-slate-500"><span>Items subtotal</span><span>{money(total)}</span></div>
            <div className="mt-2 flex items-end justify-between"><span className="text-sm font-semibold text-slate-800">Total due</span><span className="text-2xl font-bold tracking-tight text-blue-950">{money(total)}</span></div>
          </div>

          {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {success && <p role="status" className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"><Check size={16} />{success}</p>}
          <Button type="submit" disabled={busy || !cart.length || !storeId} className="mt-4 min-h-12 w-full rounded-xl text-base font-semibold">
            {busy ? "Processing sale…" : `Charge ${money(total)}`}
          </Button>
          <p className="mt-2 text-center text-[11px] text-slate-400">Stock is deducted when the sale is completed.</p>
        </form>
      </div>
    </div>
  );
}
