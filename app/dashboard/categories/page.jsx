import { getTenantDb } from "@/lib/tenant-db";
import CategoryForm from "./category-form";
import Card from "@/components/ui/card";
import PageHeader from "@/components/ui/page-header";

export default async function CategoriesPage() {
  const { db, role } = await getTenantDb();
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-xl">
      <PageHeader
        title="Categories"
        subtitle="Group your products for easier browsing"
      />

      {role === "TENANT_ADMIN" && (
        <Card className="p-5 mb-6">
          <CategoryForm />
        </Card>
      )}

      <Card>
        <ul className="divide-y divide-slate-100">
          {categories.length === 0 && (
            <li className="p-6 text-sm text-slate-400 text-center">
              No categories yet.
            </li>
          )}
          {categories.map((c) => (
            <li key={c.id} className="p-4 text-sm text-slate-700 font-medium">
              {c.name}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
