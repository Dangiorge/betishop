"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";

export default function SignupRequestRow({ request }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAction(action) {
    setLoading(true);
    const res = await fetch(
      `/api/admin/signup-requests/${request.id}/${action}`,
      { method: "POST" },
    );
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="p-4 flex items-center justify-between flex-wrap gap-3">
      <div>
        <p className="font-medium text-slate-900">{request.businessName}</p>
        <p className="text-sm text-slate-500">
          {request.ownerName} · {request.email}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Requested {new Date(request.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => handleAction("reject")}
          disabled={loading}>
          Reject
        </Button>
        <Button onClick={() => handleAction("approve")} disabled={loading}>
          Approve
        </Button>
      </div>
    </div>
  );
}
