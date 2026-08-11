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

  await prisma.signupRequest.update({
    where: { id: request.id },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });

  return NextResponse.json({ message: "Rejected" });
}
