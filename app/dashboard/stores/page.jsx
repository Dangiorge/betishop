import { getTenantDb } from "@/lib/tenant-db";
import StoreForm from "./store-form";
import StoreRow from "./store-row";
import PageHeader from "@/components/ui/page-header";
import Card from "@/components/ui/card";

export default async function StoresPage() {
  const { db, role } = await getTenantDb();
  const stores = await db.store.findMany({ orderBy: { name: "asc" } });
  const isAdmin = role === "TENANT_ADMIN";

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Stores"
        subtitle="Manage your shop's locations and what each one is allowed to do"
      />

      {isAdmin && (
        <Card className="p-5 mb-6">
          <StoreForm />
        </Card>
      )}

      <div className="space-y-3">
        {stores.map((s) => (
          <StoreRow key={s.id} store={s} isAdmin={isAdmin} />
        ))}
        {stores.length === 0 && (
          <Card className="p-6 text-center text-sm text-slate-400">
            No stores yet — add your first one above.
          </Card>
        )}
      </div>
    </div>
  );
}
