import { getTenantDb } from "@/lib/tenant-db";
import SupplierForm from "./supplier-form";
import SupplierRow from "./supplier-row";
import PageHeader from "@/components/ui/page-header";
import Card from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function SuppliersPage() {
  const { db, role } = await getTenantDb();
  if (role !== "TENANT_ADMIN") redirect("/dashboard");
  const suppliers = await db.supplier.findMany({ orderBy: { name: "asc" } });
  const isAdmin = role === "TENANT_ADMIN";

  return (
    <div className="max-w-3xl">
      <PageHeader title="Suppliers" subtitle="Vendors you buy stock from" />

      {isAdmin && (
        <div className="mb-6">
          <SupplierForm />
        </div>
      )}

      <div className="space-y-3">
        {suppliers.map((s) => (
          <SupplierRow key={s.id} supplier={s} isAdmin={isAdmin} />
        ))}
        {suppliers.length === 0 && (
          <Card className="p-6 text-center text-sm text-slate-400">
            No suppliers yet — add your first one above.
          </Card>
        )}
      </div>
    </div>
  );
}
