import { getTenantDb } from "@/lib/tenant-db";
import { notFound } from "next/navigation";
import VariantForm from "./variant-form";
import VariantRow from "./variant-row";
import Card from "@/components/ui/card";

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const { db, role } = await getTenantDb();

  const product = await db.product.findUnique({
    where: { id },
    include: { category: true, variants: { orderBy: { createdAt: "asc" } } },
  });

  if (!product) notFound();

  const isAdmin = role === "TENANT_ADMIN";

  return (
    <div>
      <div className="mb-8 flex gap-4 items-start">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-xl"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-slate-100" />
        )}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {product.name}
          </h1>
          <p className="text-sm text-slate-500">
            {product.category.name} · {product.type}
          </p>
          {product.description && (
            <p className="text-sm text-slate-600 mt-2 max-w-lg">
              {product.description}
            </p>
          )}
        </div>
      </div>

      <Card>
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <h2 className="text-sm font-medium text-slate-700">Variants</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {product.variants.map((v) => (
            <VariantRow key={v.id} variant={v} isAdmin={isAdmin} />
          ))}
          {product.variants.length === 0 && (
            <p className="p-6 text-sm text-slate-400 text-center">
              No variants yet — add the first one below.
            </p>
          )}
        </div>
        {isAdmin && (
          <div className="p-5 border-t border-slate-100">
            <VariantForm productId={product.id} />
          </div>
        )}
      </Card>
    </div>
  );
}
