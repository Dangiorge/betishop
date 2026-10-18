"use client";

export default function VariantRow({ variant, isAdmin, isSimpleItem = false }) {
  const totalStock =
    variant.storeStocks?.reduce((sum, s) => sum + s.qty, 0) ?? 0;
  const low = totalStock <= 3;

  return (
    <div className="p-4 flex items-center justify-between flex-wrap gap-3">
      <div>
        <p className="text-sm font-medium text-slate-900">
          {[variant.color, variant.size].filter(Boolean).join(" · ") ||
            (isSimpleItem ? "Single item · no options" : "Default")}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          {isAdmin && <>Cost ETB {Number(variant.costPrice).toLocaleString()} · </>}
          Sell ETB {Number(variant.sellPrice).toLocaleString()}
        </p>
      </div>
      <span
        className={`text-sm font-medium px-2.5 py-1 rounded-full ${low ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-700"}`}>
        {totalStock} in stock{isAdmin ? " (all stores)" : " at your store"}
      </span>
    </div>
  );
}
