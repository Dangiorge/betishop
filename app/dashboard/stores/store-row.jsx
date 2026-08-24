"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Trash2 } from "lucide-react";
import Card from "@/components/ui/card";

const PERMISSIONS = [
  { key: "allowSales", label: "Sales" },
  { key: "allowGRN", label: "GRN" },
  { key: "allowInternalTransfer", label: "Transfer" },
  { key: "allowDisposal", label: "Disposal/Returns" },
  { key: "allowPurchaseRequest", label: "Purchase Req." },
];

export default function StoreRow({ store, isAdmin }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function togglePermission(key) {
    if (!isAdmin) return;
    setLoading(true);
    await fetch(`/api/stores/${store.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: !store[key] }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${store.name}"?`)) return;
    const res = await fetch(`/api/stores/${store.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Could not delete store");
      return;
    }
    router.refresh();
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{store.name}</p>
          {store.address && (
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin size={12} /> {store.address}
            </p>
          )}
        </div>
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {PERMISSIONS.map((p) => (
          <button
            key={p.key}
            disabled={!isAdmin || loading}
            onClick={() => togglePermission(p.key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:cursor-default ${
              store[p.key]
                ? "bg-blue-900 text-white border-blue-900"
                : "bg-white text-slate-500 border-slate-200"
            } ${isAdmin ? "hover:opacity-80" : ""}`}>
            {p.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
