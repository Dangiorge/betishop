import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { slug, name, rating, message } = await request.json();
    const score = Number(rating);
    if (typeof slug !== "string" || !Number.isInteger(score) || score < 1 || score > 5 || typeof message !== "string" || message.trim().length < 4 || message.trim().length > 1000) {
      return NextResponse.json({ error: "Choose a rating and enter feedback between 4 and 1000 characters" }, { status: 400 });
    }
    const tenant = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!tenant) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    await prisma.storeFeedback.create({ data: { tenantId: tenant.id, name: typeof name === "string" ? name.trim().slice(0, 100) || null : null, rating: score, message: message.trim() } });
    return NextResponse.json({ message: "Thank you for your feedback" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not submit feedback" }, { status: 500 });
  }
}
