import { redirect } from "next/navigation";
import { getTenantDb } from "@/lib/tenant-db";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/page-header";
import GuestQr from "./guest-qr";

export default async function GuestPageSettings() {
  const { tenantId, role } = await getTenantDb();
  if (role !== "TENANT_ADMIN") redirect("/dashboard");
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true, slug: true } });
  return <div className="max-w-3xl"><PageHeader title="Guest catalog and QR code" subtitle="Share prices with customers and collect feedback without asking them to sign in." /><section className="rounded-xl border border-slate-200 bg-white p-5"><p className="font-medium">{tenant.name}</p><p className="mt-1 break-all text-sm text-slate-500">Public catalog: /s/{tenant.slug}</p><GuestQr slug={tenant.slug} /></section></div>;
}
