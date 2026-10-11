"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, MapPin, Pencil, Trash2 } from "lucide-react";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";

export default function SupplierRow({ supplier, isAdmin }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: supplier.name,
    contactPerson: supplier.contactPerson || "",
    phone: supplier.phone || "",
    email: supplier.email || "",
    address: supplier.address || "",
    taxId: supplier.taxId || "",
    paymentTerms: supplier.paymentTerms || "",
    notes: supplier.notes || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    setError("");
    setLoading(true);
    const res = await fetch(`/api/suppliers/${supplier.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${supplier.name}"?`)) return;
    const res = await fetch(`/api/suppliers/${supplier.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Could not delete supplier");
      return;
    }
    router.refresh();
  }

  if (editing) {
    return (
      <Card className="p-5 space-y-3">
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Supplier name"
          required
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            name="contactPerson"
            value={form.contactPerson}
            onChange={handleChange}
            placeholder="Contact person"
          />
          <Input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <Input
            name="taxId"
            value={form.taxId}
            onChange={handleChange}
            placeholder="Tax ID"
          />
        </div>
        <Input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address"
        />
        <Input
          name="paymentTerms"
          value={form.paymentTerms}
          onChange={handleChange}
          placeholder="Payment terms"
        />
        <Textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={2}
          placeholder="Notes"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button variant="secondary" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{supplier.name}</p>
          {supplier.contactPerson && (
            <p className="text-sm text-slate-500">{supplier.contactPerson}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
            {supplier.phone && (
              <span className="flex items-center gap-1">
                <Phone size={12} /> {supplier.phone}
              </span>
            )}
            {supplier.email && (
              <span className="flex items-center gap-1">
                <Mail size={12} /> {supplier.email}
              </span>
            )}
            {supplier.address && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {supplier.address}
              </span>
            )}
          </div>
          {supplier.paymentTerms && (
            <p className="text-xs text-slate-400 mt-1">
              Terms: {supplier.paymentTerms}
            </p>
          )}
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
