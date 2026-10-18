"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/image-uploader";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

const EMPTY_FORM = {
  name: "",
  categoryId: "",
  type: "SHOE",
  description: "",
  brand: "",
  gender: "",
  material: "",
  countryOfOrigin: "",
  tags: "",
  imageUrl: "",
  costPrice: "",
  sellPrice: "",
};

export default function ProductForm({ categories }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { costPrice, sellPrice, ...product } = form;
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          ...(form.type === "BAG" ? { defaultVariant: { costPrice, sellPrice } } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setForm(EMPTY_FORM);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Could not save the product. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>+ Add product</Button>;
  }

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <ImageUploader
            value={form.imageUrl}
            onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
          />
          <div className="w-full min-w-0 flex-1 space-y-3">
            <Input
              name="name"
              placeholder="Product name (e.g. Adidas Runner)"
              value={form.name}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentId ? `— ${c.name}` : c.name}
                  </option>
                ))}
              </Select>
              <Select name="type" value={form.type} onChange={handleChange}>
                <option value="SHOE">Shoe</option>
                <option value="BAG">Bag</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>

            {form.type === "BAG" && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-sm font-semibold text-slate-800">Single item</p>
                <p className="mt-1 text-xs text-slate-600">Bags are added without size or color options. Receive their quantity later from New Inventory.</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input name="costPrice" type="number" min="0" step="0.01" placeholder="Cost price (ETB)" value={form.costPrice} onChange={handleChange} required />
                  <Input name="sellPrice" type="number" min="0.01" step="0.01" placeholder="Selling price (ETB)" value={form.sellPrice} onChange={handleChange} required />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                name="brand"
                placeholder="Brand (e.g. Adidas)"
                value={form.brand}
                onChange={handleChange}
              />
              <Select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Gender / audience</option>
                <option value="MEN">Men</option>
                <option value="WOMEN">Women</option>
                <option value="UNISEX">Unisex</option>
                <option value="KIDS">Kids</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                name="material"
                placeholder="Material (e.g. Genuine leather)"
                value={form.material}
                onChange={handleChange}
              />
              <Input
                name="countryOfOrigin"
                placeholder="Country of origin"
                value={form.countryOfOrigin}
                onChange={handleChange}
              />
            </div>

            <Input
              name="tags"
              placeholder="Tags, comma separated (e.g. running, summer)"
              value={form.tags}
              onChange={handleChange}
            />

            <Textarea
              name="description"
              placeholder="Description (optional)"
              value={form.description}
              onChange={handleChange}
              rows={2}
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save product"}
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
