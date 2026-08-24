import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/tenant-db";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { db } = await getTenantDb();
    const supplier = await db.supplier.findUnique({ where: { id } });
    if (!supplier)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(supplier);
  } catch (e) {
    if (e.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") {
      return NextResponse.json(
        { error: "Only the shop admin can edit suppliers" },
        { status: 403 },
      );
    }

    const {
      name,
      contactPerson,
      phone,
      email,
      address,
      taxId,
      paymentTerms,
      notes,
    } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Supplier name is required" },
        { status: 400 },
      );
    }

    const supplier = await db.supplier.update({
      where: { id },
      data: {
        name: name.trim(),
        contactPerson: contactPerson?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        taxId: taxId?.trim() || null,
        paymentTerms: paymentTerms?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(supplier);
  } catch (e) {
    if (e.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const { db, role } = await getTenantDb();
    if (role !== "TENANT_ADMIN") {
      return NextResponse.json(
        { error: "Only the shop admin can delete suppliers" },
        { status: 403 },
      );
    }

    const [grnCount, prCount] = await Promise.all([
      db.gRN.count({ where: { supplierId: id } }),
      db.purchaseRequest.count({ where: { supplierId: id } }),
    ]);

    if (grnCount > 0 || prCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete: this supplier has GRN or purchase request history",
        },
        { status: 409 },
      );
    }

    await db.supplier.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (e) {
    if (e.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
