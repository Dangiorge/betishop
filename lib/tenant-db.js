import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns { db, session, tenantId, role } where `db` is a Prisma client
 * scoped to the current user's tenant — every query against tenant-owned
 * models automatically gets `tenantId` injected/filtered.
 *
 * Throws if there's no session, so callers don't need to repeat auth checks.
 */
export async function getTenantDb() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("UNAUTHENTICATED");
  }

  const { tenantId, role } = session.user;

  const tenantModels = new Set([
    "category",
    "product",
    "variant",
    "stockMovement",
    "sale",
    "expense",
    "closingPeriod",
    "stockCount",
  ]);

  const db = prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
          if (!tenantModels.has(modelKey)) {
            return query(args);
          }

          if (
            [
              "findFirst",
              "findFirstOrThrow",
              "findUnique",
              "findUniqueOrThrow",
              "findMany",
              "update",
              "updateMany",
              "delete",
              "deleteMany",
              "count",
              "aggregate",
              "groupBy",
            ].includes(operation)
          ) {
            args.where = { ...(args.where ?? {}), tenantId };
          }

          if (operation === "create") {
            args.data = { ...args.data, tenantId };
          }
          if (operation === "createMany") {
            args.data = Array.isArray(args.data)
              ? args.data.map((d) => ({ ...d, tenantId }))
              : args.data;
          }

          return query(args);
        },
      },
    },
  });

  return { db, session, tenantId, role };
}
