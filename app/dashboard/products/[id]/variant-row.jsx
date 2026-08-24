"use client";

export default function VariantRow({ variant }) {
  const totalStock =
    variant.storeStocks?.reduce((sum, s) => sum + s.qty, 0) ?? 0;
  const low = totalStock <= 3;

  return (
    <div className="p-4 flex items-center justify-between flex-wrap gap-3">
      <div>
        <p className="text-sm font-medium text-slate-900">
          {[variant.color, variant.size].filter(Boolean).join(" · ") ||
            "Default"}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          Cost ${Number(variant.costPrice).toFixed(2)} · Sell $
          {Number(variant.sellPrice).toFixed(2)}
        </p>
      </div>
      <span
        className={`text-sm font-medium px-2.5 py-1 rounded-full ${low ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-700"}`}>
        {totalStock} in stock (all stores)
      </span>
    </div>
  );
}
