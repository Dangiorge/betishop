import { getTenantDb } from "@/lib/tenant-db";

export async function requireShopOwner() {
  const context = await getTenantDb();
  if (context.role !== "TENANT_ADMIN") {
    const error = new Error("FORBIDDEN");
    throw error;
  }
  return context;
}

export function isSalesRole(role) {
  return role === "SALES_PERSON" || role === "EMPLOYEE";
}
