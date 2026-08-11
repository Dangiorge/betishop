import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const platformTenant = await prisma.tenant.upsert({
    where: { slug: "platform" },
    update: {},
    create: {
      name: "Platform",
      slug: "platform",
    },
  });

  const hashedPassword = await bcrypt.hash("CHANGE_ME_STRONG_PASSWORD", 10);

  await prisma.user.upsert({
    where: { email: "you@example.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "you@example.com",
      hashedPassword,
      role: "SUPER_ADMIN",
      tenantId: platformTenant.id,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
