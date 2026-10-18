import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "TENANT_ADMIN") {
    return NextResponse.json({ error: "Only the shop owner can upload product images" }, { status: 403 });
  }

  const config = cloudinary.config();
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    return NextResponse.json(
      { error: "Product image uploads are not configured. Add CLOUDINARY_URL or the three separate Cloudinary settings to the deployment environment." },
      { status: 503 },
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = `betishop/${session.user.tenantId}`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    config.api_secret,
  );

  return NextResponse.json({
    timestamp,
    signature,
    folder,
    apiKey: config.api_key,
    cloudName: config.cloud_name,
  });
}
