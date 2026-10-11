"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

const EMPTY_ITEM = { variantId: "", qty: "", unitCost: "" };

export default function GRNForm({ stores, suppliers, variants }) {
  const [open, setOpen] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function updateItem(index, field, value) {
    setItems((its) =>
      its.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
    );
  }

  function addItem() {
    setItems((its) => [...its, { ...EMPTY_ITEM }]);
  }

  function removeItem(index) {
    setItems((its) => its.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!storeId) {
      setError("Select a store");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/grns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        supplierId: supplierId || null,
        referenceNo,
        note,
        items,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    setStoreId("");
    setSupplierId("");
    setReferenceNo("");
    setNote("");
    setItems([{ ...EMPTY_ITEM }]);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>+ New GRN</Button>;
  }

  if (stores.length === 0) {
    return (
      <Card className="p-5 text-sm text-slate-500">
        No stores allow GRN right now. Enable it for a store on the Stores page
        first.
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm font-medium text-slate-700">New GRN</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            required>
            <option value="">Select store</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}>
            <option value="">No supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            placeholder="Reference no. (optional)"
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
          />
          <Input
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-500">Items</p>
          {items.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-[minmax(0,1fr)_60px_80px_32px] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_80px_100px_auto]">
              <Select
                value={item.variantId}
                onChange={(e) => updateItem(i, "variantId", e.target.value)}
                required>
                <option value="">Select item</option>
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                min="1"
                placeholder="Qty"
                value={item.qty}
                onChange={(e) => updateItem(i, "qty", e.target.value)}
                required
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Unit cost"
                value={item.unitCost}
                onChange={(e) => updateItem(i, "unitCost", e.target.value)}
                required
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="p-1.5 text-slate-400 hover:text-red-600">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="text-xs text-blue-900 font-medium flex items-center gap-1 hover:underline">
            <Plus size={14} /> Add another item
          </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Record GRN"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
