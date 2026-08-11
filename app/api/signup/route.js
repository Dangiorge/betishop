import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const { businessName, ownerName, email, password } = await req.json();

  if (!businessName || !ownerName || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.signupRequest.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Request already exists for this email" },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.signupRequest.create({
    data: { businessName, ownerName, email, hashedPassword },
  });

  return NextResponse.json({
    message: "Signup request submitted for approval",
  });
}
