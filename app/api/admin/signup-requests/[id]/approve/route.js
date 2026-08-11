import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;

  const request = await prisma.signupRequest.findUnique({ where: { id } });
  if (!request || request.status !== "PENDING") {
    return NextResponse.json(
      { error: "Request not found or already reviewed" },
      { status: 404 },
    );
  }

  const tenantSlug = request.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { name: request.businessName, slug: tenantSlug },
    });

    const user = await tx.user.create({
      data: {
        name: request.ownerName,
        email: request.email,
        hashedPassword: request.hashedPassword,
        role: "TENANT_ADMIN",
        tenantId: tenant.id,
      },
    });

    await tx.signupRequest.update({
      where: { id: request.id },
      data: { status: "APPROVED", reviewedAt: new Date() },
    });

    return { tenant, user };
  });

  return NextResponse.json({ message: "Approved", tenant: result.tenant.slug });
}
