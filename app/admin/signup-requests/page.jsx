import { prisma } from "@/lib/prisma";
import SignupRequestRow from "./signup-request-row";

export default async function SignupRequestsPage() {
  const requests = await prisma.signupRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pending = requests.filter((r) => r.status === "PENDING");
  const reviewed = requests.filter((r) => r.status !== "PENDING");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Signup Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Approve or reject new shop account requests
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-medium text-slate-700">
            Pending ({pending.length})
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {pending.length === 0 && (
            <p className="p-6 text-sm text-slate-400 text-center">
              No pending requests.
            </p>
          )}
          {pending.map((r) => (
            <SignupRequestRow key={r.id} request={r} />
          ))}
        </div>
      </div>

      {reviewed.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-medium text-slate-700">Reviewed</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {reviewed.map((r) => (
              <div
                key={r.id}
                className="p-4 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-900">{r.businessName}</p>
                  <p className="text-slate-500">
                    {r.ownerName} · {r.email}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    r.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
