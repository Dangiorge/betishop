"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function VariantForm({ productId }) {
  const [form, setForm] = useState({
    color: "",
    size: "",
    sku: "",
    costPrice: "",
    sellPrice: "",
    stockQty: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/products/${productId}/variants`, {
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

    setForm({
      color: "",
      size: "",
      sku: "",
      costPrice: "",
      sellPrice: "",
      stockQty: "",
    });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Add variant</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Input
          name="color"
          placeholder="Color (e.g. Gray)"
          value={form.color}
          onChange={handleChange}
        />
        <Input
          name="size"
          placeholder="Size (e.g. 42)"
          value={form.size}
          onChange={handleChange}
        />
        <Input
          name="sku"
          placeholder="SKU (optional)"
          value={form.sku}
          onChange={handleChange}
        />
        <Input
          name="costPrice"
          type="number"
          step="0.01"
          placeholder="Cost price"
          value={form.costPrice}
          onChange={handleChange}
          required
        />
        <Input
          name="sellPrice"
          type="number"
          step="0.01"
          placeholder="Sell price"
          value={form.sellPrice}
          onChange={handleChange}
          required
        />
        <Input
          name="stockQty"
          type="number"
          placeholder="Initial stock"
          value={form.stockQty}
          onChange={handleChange}
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add variant"}
      </Button>
    </form>
  );
}
