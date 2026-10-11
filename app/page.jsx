import Link from "next/link";

export default function Home() {
  return <main className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-8"><span className="text-xl font-bold text-blue-950">BetiShop</span><div className="flex gap-2"><Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Log in</Link><Link href="/signup" className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900">Request a shop account</Link></div></header>
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-16 sm:px-8 lg:py-24"><p className="text-sm font-semibold uppercase tracking-widest text-blue-800">Shop operations, in one place</p><h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">Know what you have. Know what you sell.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Manage products and stock across your stores, record sales and payments, track expenses, and give customers a simple QR catalog to browse.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/signup" className="rounded-lg bg-blue-950 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900">Get started</Link><Link href="/login" className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">Shop owner or staff login</Link></div></section>
    <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-sm text-slate-500">BetiShop · Inventory and sales management</footer>
  </main>;
}
