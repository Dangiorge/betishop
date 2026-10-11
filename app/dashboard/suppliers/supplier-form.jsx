"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

const EMPTY = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  taxId: "",
  paymentTerms: "",
  notes: "",
};

export default function SupplierForm() {
  const [form, setForm] = useState(EMPTY);
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

    const res = await fetch("/api/suppliers", {
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
    return <Button onClick={() => setOpen(true)}>+ Add supplier</Button>;
  }

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Add supplier</p>

        <Input
          name="name"
          placeholder="Supplier / company name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            name="contactPerson"
            placeholder="Contact person"
            value={form.contactPerson}
            onChange={handleChange}
          />
          <Input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            name="taxId"
            placeholder="Tax ID / registration no."
            value={form.taxId}
            onChange={handleChange}
          />
        </div>

        <Input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />

        <Input
          name="paymentTerms"
          placeholder="Payment terms (e.g. Net 30, Cash on delivery)"
          value={form.paymentTerms}
          onChange={handleChange}
        />

        <Textarea
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
          rows={2}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save supplier"}
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
