import { redirect } from "next/navigation";
import { getTenantDb } from "@/lib/tenant-db";
import PageHeader from "@/components/ui/page-header";

export default async function FeedbackPage() {
  const { db, role } = await getTenantDb();
  if (role !== "TENANT_ADMIN") redirect("/dashboard");
  const feedback = await db.storeFeedback.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const average = feedback.length ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length : 0;
  return <div className="max-w-4xl"><PageHeader title="Guest feedback" subtitle="Customer comments submitted from your public catalog." /><div className="mb-5 rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Recent average rating</p><p className="text-2xl font-semibold">{average.toFixed(1)} / 5 <span className="text-sm font-normal text-slate-500">from {feedback.length} responses</span></p></div><div className="space-y-3">{feedback.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-medium">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)} <span className="ml-2 text-sm text-slate-600">{item.name || "Guest"}</span></p><time className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleString()}</time></div><p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{item.message}</p></article>)}{!feedback.length && <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">No feedback received yet.</p>}</div></div>;
}
