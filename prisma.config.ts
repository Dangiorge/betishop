import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrations: {
    path: path.join(__dirname, "prisma", "migrations"),
    seed: "node prisma/seed.js",
  },
  datasource: {
    // `prisma generate` does not need a database connection. Keep the URL
    // optional so production builds can generate Prisma Client without DB
    // secrets; database commands still read DATABASE_URL when it is set.
    url: process.env.DATABASE_URL,
  },
});
