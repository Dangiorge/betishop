"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function VariantRow({ variant, isAdmin }) {
  const [restocking, setRestocking] = useState(false);
  const [qty, setQty] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRestock() {
    if (!qty || Number(qty) <= 0) return;
    setLoading(true);
    const res = await fetch(`/api/variants/${variant.id}/restock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty }),
    });
    setLoading(false);
    if (res.ok) {
      setQty("");
      setRestocking(false);
      router.refresh();
    }
  }

  const low = variant.stockQty <= 3;

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
      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-medium px-2.5 py-1 rounded-full ${low ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-700"}`}>
          {variant.stockQty} in stock
        </span>
        {isAdmin && !restocking && (
          <Button
            variant="secondary"
            className="px-2.5 py-1.5 text-xs"
            onClick={() => setRestocking(true)}>
            Restock
          </Button>
        )}
        {isAdmin && restocking && (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Qty"
              autoFocus
              className="w-16 py-1.5"
            />
            <Button
              onClick={handleRestock}
              disabled={loading}
              className="px-2 py-1.5 text-xs">
              Add
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
