import { getTenantDb } from "@/lib/tenant-db";
import { notFound } from "next/navigation";
import VariantForm from "./variant-form";
import VariantRow from "./variant-row";
import Card from "@/components/ui/card";

const GENDER_LABELS = {
  MEN: "Men",
  WOMEN: "Women",
  UNISEX: "Unisex",
  KIDS: "Kids",
};

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const { db, role } = await getTenantDb();

  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: {
        orderBy: { createdAt: "asc" },
        include: { storeStocks: true },
      },
    },
  });

  if (!product) notFound();

  const isAdmin = role === "TENANT_ADMIN";

  const details = [
    { label: "Category", value: product.category.name },
    {
      label: "Type",
      value: product.type.charAt(0) + product.type.slice(1).toLowerCase(),
    },
    { label: "Brand", value: product.brand },
    {
      label: "Gender",
      value: product.gender ? GENDER_LABELS[product.gender] : null,
    },
    { label: "Material", value: product.material },
    { label: "Country of origin", value: product.countryOfOrigin },
  ].filter((d) => d.value);

  return (
    <div>
      <div className="mb-6 flex gap-4 items-start flex-wrap">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-24 h-24 object-cover rounded-xl"
          />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-slate-100" />
        )}
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-2xl font-semibold text-slate-900">
            {product.name}
          </h1>
          {product.description && (
            <p className="text-sm text-slate-600 mt-2 max-w-lg">
              {product.description}
            </p>
          )}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <Card className="p-5 mb-6">
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {details.map((d) => (
            <div key={d.label}>
              <dt className="text-xs text-slate-400 uppercase tracking-wide">
                {d.label}
              </dt>
              <dd className="text-sm text-slate-800 font-medium mt-0.5">
                {d.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

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
