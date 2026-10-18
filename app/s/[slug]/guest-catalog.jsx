"use client";

import { useMemo, useState } from "react";
import { Search, ShoppingBag, Store } from "lucide-react";

const formatPrice = (value) => `ETB ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function GuestCatalog({ products }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All items");
  const categories = useMemo(() => ["All items", ...new Set(products.map((product) => product.category))], [products]);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return products.filter((product) => {
      if (category !== "All items" && product.category !== category) return false;
      const detail = product.variants.flatMap((variant) => [variant.color, variant.size]).filter(Boolean).join(" ");
      return [product.name, product.brand, product.category, detail].filter(Boolean).join(" ").toLocaleLowerCase().includes(query);
    });
  }, [category, products, search]);

  return (
    <>
      <label className="relative block">
        <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the collection" className="min-h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-base shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-800 focus:ring-4 focus:ring-blue-900/10" />
      </label>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Filter products by category">
        {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition ${category === item ? "bg-blue-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}>{item}</button>)}
      </div>

      {filtered.length ? (
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((product) => {
            const prices = product.variants.map((variant) => variant.price);
            const inStock = product.variants.some((variant) => variant.stores.length);
            return (
              <article key={product.id} className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="grid size-full place-items-center text-slate-300"><ShoppingBag size={42} aria-hidden="true" /></div>}
                  <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm ${inStock ? "bg-white text-emerald-800" : "bg-white text-slate-600"}`}><span className={`size-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-slate-400"}`} />{inStock ? "In stock" : "Ask about availability"}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.13em] text-blue-800">{product.category}</p><h3 className="mt-1 truncate text-lg font-bold text-slate-950">{product.name}</h3>{product.brand && <p className="mt-0.5 text-sm text-slate-500">{product.brand}</p>}</div><p className="shrink-0 text-sm font-extrabold text-blue-950">{prices.length > 1 && Math.min(...prices) !== Math.max(...prices) ? `${formatPrice(Math.min(...prices))}+` : formatPrice(prices[0])}</p></div>
                  <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
                    {product.variants.map((variant) => {
                      const options = [variant.color, variant.size].filter(Boolean).join(" / ");
                      return <li key={variant.id} className="flex items-start justify-between gap-3 py-3 text-sm"><div className="min-w-0"><p className="font-medium text-slate-800">{options || "Standard item"}</p><p className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-slate-500"><Store size={13} className="mt-0.5 shrink-0" aria-hidden="true" /><span>{variant.stores.length ? variant.stores.join(", ") : "Ask the shop for availability"}</span></p></div><strong className="shrink-0 text-slate-900">{formatPrice(variant.price)}</strong></li>;
                    })}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center"><ShoppingBag size={34} className="mx-auto text-slate-300" aria-hidden="true" /><p className="mt-3 font-semibold text-slate-800">No matching items</p><p className="mt-1 text-sm text-slate-500">Try a different search or category.</p></div>
      )}
    </>
  );
}
