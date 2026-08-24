"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

const PERMISSIONS = [
  { key: "allowSales", label: "Sales" },
  { key: "allowGRN", label: "GRN (goods received)" },
  { key: "allowInternalTransfer", label: "Internal Transfer" },
  { key: "allowDisposal", label: "Disposal / Returns" },
  { key: "allowPurchaseRequest", label: "Purchase Requests" },
];

const EMPTY = {
  name: "",
  address: "",
  allowSales: true,
  allowGRN: true,
  allowInternalTransfer: true,
  allowDisposal: true,
  allowPurchaseRequest: true,
};

export default function StoreForm() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function toggle(key) {
    setForm((f) => ({ ...f, [key]: !f[key] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    setForm(EMPTY);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>+ Add store</Button>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm font-medium text-slate-700">Add store</p>
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Store name (e.g. Main Warehouse)"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <Input
          placeholder="Address (optional)"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-2">This store is allowed to:</p>
        <div className="flex flex-wrap gap-2">
          {PERMISSIONS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => toggle(p.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                form[p.key]
                  ? "bg-blue-900 text-white border-blue-900"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save store"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
