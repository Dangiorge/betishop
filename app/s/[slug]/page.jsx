import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GuestCatalog from "./guest-catalog";
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

  const products = tenant.products.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    imageUrl: product.imageUrl,
    category: product.category.name,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      color: variant.color,
      size: variant.size,
      price: Number(variant.sellPrice),
      stores: variant.storeStocks.filter((stock) => stock.qty > 0).map((stock) => stock.store.name),
    })),
  }));
  const itemCount = products.reduce((sum, product) => sum + product.variants.length, 0);
  const categoryCount = new Set(products.map((product) => product.category)).size;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="relative overflow-hidden bg-[#101d3a] text-white">
        <div className="pointer-events-none absolute -right-24 -top-36 size-[30rem] rounded-full border-[70px] border-white/[0.035]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-7 sm:pb-16 sm:pt-7 lg:px-10">
          <nav className="flex items-center justify-between border-b border-white/10 pb-5">
            <a href="#top" className="flex items-center gap-3" aria-label="Back to top">
              <span className="grid size-10 place-items-center rounded-xl bg-white text-lg font-black text-blue-950">B</span>
              <span className="text-sm font-bold tracking-tight sm:text-base">BetiShop <span className="font-normal text-blue-200">catalog</span></span>
            </a>
            <a href="#feedback" className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:text-sm">Give feedback</a>
          </nav>

          <div id="top" className="grid items-end gap-8 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200"><span className="size-1.5 rounded-full bg-emerald-300" /> Local shop collection</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Discover <span className="text-emerald-300">{tenant.name}</span></h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">Explore the collection, compare prices, and check which items are in stock before you visit.</p>
              <a href="#catalog" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-300 px-5 text-sm font-bold text-[#10213e] transition hover:bg-emerald-200">Browse the collection <span className="ml-2" aria-hidden="true">↓</span></a>
            </div>
            <div className="grid max-w-md grid-cols-2 gap-3 lg:min-w-72">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-2xl font-bold">{products.length}</p><p className="mt-1 text-xs text-slate-300">Products</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-2xl font-bold">{categoryCount}</p><p className="mt-1 text-xs text-slate-300">Categories</p></div>
              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-sm font-semibold">Prices in Ethiopian birr</p><p className="mt-1 text-xs text-slate-300">Stock availability is updated by the shop.</p></div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-8 sm:px-7 sm:py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-10">
        <section id="catalog" className="min-w-0 scroll-mt-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-800">The collection</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Shop items</h2></div>
            <p className="text-sm text-slate-500">{itemCount} items to explore</p>
          </div>
          <GuestCatalog products={products} />
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <section id="feedback" className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-blue-950 px-5 py-5 text-white"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-300">Your voice matters</p><h2 className="mt-1 text-xl font-bold">How was your visit?</h2><p className="mt-1 text-sm text-blue-100">Share a quick note with {tenant.name}.</p></div>
            <div className="p-5"><GuestFeedbackForm slug={slug} /></div>
          </section>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5"><p className="text-sm font-bold text-blue-950">Need help choosing?</p><p className="mt-1 text-sm leading-6 text-blue-900/75">Availability can change during the day. Ask the shop to confirm an item before making a trip.</p></div>
        </aside>
      </div>

      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-500">Prices and products provided by {tenant.name} · Powered by BetiShop</footer>
    </main>
  );
}
