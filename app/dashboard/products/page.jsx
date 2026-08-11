import { getTenantDb } from "@/lib/tenant-db";
import Link from "next/link";
import ProductForm from "./product-form";
import PageHeader from "@/components/ui/page-header";
import Card from "@/components/ui/card";

export default async function ProductsPage() {
  const { db, role } = await getTenantDb();

  const [products, categories] = await Promise.all([
    db.product.findMany({
      include: { category: true, variants: true },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const isAdmin = role === "TENANT_ADMIN";

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Your full catalog, grouped by variant"
      />

      {isAdmin && (
        <div className="mb-6">
          <ProductForm categories={categories} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => {
          const totalStock = p.variants.reduce((sum, v) => sum + v.stockQty, 0);
          return (
            <Link key={p.id} href={`/dashboard/products/${p.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow flex gap-3">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-16 h-16 object-cover rounded-lg shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-100 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-slate-500">{p.category.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {p.variants.length} variant{p.variants.length !== 1 && "s"}{" "}
                    · {totalStock} in stock
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
        {products.length === 0 && (
          <p className="text-slate-400 text-sm col-span-full text-center py-8">
            No products yet.
          </p>
        )}
      </div>
    </div>
  );
}
