import { getTenantDb } from "@/lib/tenant-db";
import CategoryForm from "./category-form";
import CategoryTree from "./category-tree";
import PageHeader from "@/components/ui/page-header";
import Card from "@/components/ui/card";

export default async function CategoriesPage() {
  const { db, role } = await getTenantDb();
  const categories = await db.category.findMany({
    include: { _count: { select: { products: true, children: true } } },
    orderBy: { name: "asc" },
  });

  const isAdmin = role === "TENANT_ADMIN";
  const roots = categories.filter((c) => !c.parentId);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Categories"
        subtitle="Organize your catalog with categories and subcategories"
      />

      {isAdmin && (
        <Card className="p-5 mb-6">
          <CategoryForm categories={categories} />
        </Card>
      )}

      <Card>
        {roots.length === 0 && (
          <p className="p-6 text-sm text-slate-400 text-center">
            No categories yet.
          </p>
        )}
        <div className="divide-y divide-slate-100">
          {roots.map((c) => (
            <CategoryTree
              key={c.id}
              category={c}
              allCategories={categories}
              isAdmin={isAdmin}
              depth={0}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
