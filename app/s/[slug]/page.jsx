import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GuestFeedbackForm from "./guest-feedback-form";

export default async function GuestShopPage({ params }) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      products: {
        where: { variants: { some: {} } },
        include: {
          category: { select: { name: true } },
          variants: {
            include: {
              storeStocks: {
                include: { store: { select: { id: true, name: true } } },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });
  if (!tenant) notFound();
  const stores = await prisma.store.findMany({ where: { tenantId: tenant.id }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  const products = tenant.products.filter((p) => p.variants.length);
  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <header className="bg-slate-900 px-4 py-8 text-white sm:py-12"><div className="mx-auto max-w-5xl"><p className="text-sm font-medium text-blue-200">BetiShop product catalog</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">{tenant.name}</h1><p className="mt-2 text-slate-300">Browse products, sizes, colors, and prices. Ask the shop to confirm availability.</p></div></header>
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1fr_320px]">
      <section><h2 className="mb-4 text-xl font-semibold">Products</h2>{products.length ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{products.map((product) => <article key={product.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">{product.imageUrl && <img src={product.imageUrl} alt={product.name} className="h-48 w-full object-cover" />}<div className="p-4"><p className="text-xs uppercase tracking-wide text-slate-500">{product.category.name}</p><h3 className="mt-1 font-semibold">{product.name}</h3>{product.brand && <p className="text-sm text-slate-500">{product.brand}</p>}<ul className="mt-3 divide-y divide-slate-100">{product.variants.map((variant) => {
            const stockByStore = Object.fromEntries(variant.storeStocks.map((s) => [s.storeId, s.qty]));
            return <li key={variant.id} className="flex items-center justify-between gap-3 py-2 text-sm"><div><p>{[variant.color, variant.size].filter(Boolean).join(" / ") || "Standard"}</p><p className="text-xs text-slate-500">{stores.filter((s) => (stockByStore[s.id] || 0) > 0).map((s) => s.name).join(", ") || "Ask about availability"}</p></div><strong className="shrink-0">ETB {Number(variant.sellPrice).toLocaleString()}</strong></li>;
          })}</ul></div></article>)}</div> : <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">The shop has not published products yet.</p>}</section>
      <aside className="space-y-5"><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-semibold">Send feedback</h2><p className="mt-1 text-sm text-slate-500">Tell the shop how your experience went.</p><GuestFeedbackForm slug={slug} /></section><section className="rounded-xl bg-blue-50 p-5 text-sm text-blue-950"><p className="font-semibold">Interested in an item?</p><p className="mt-1">Contact the shop directly to confirm size and availability before visiting.</p></section></aside>
    </div>
    <footer className="border-t border-slate-200 px-4 py-5 text-center text-xs text-slate-500">Catalog powered by BetiShop</footer>
  </main>;
}
