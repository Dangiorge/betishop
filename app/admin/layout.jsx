import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/sidebar";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const pendingCount = await prisma.signupRequest.count({
    where: { status: "PENDING" },
  });

  const navItems = [
    { href: "/admin/dashboard", label: "All Shops", icon: "dashboard" },
    {
      href: "/admin/signup-requests",
      label: "Signup Requests",
      icon: "clipboard-list",
      badge: pendingCount,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        navItems={navItems}
        title="BetiShop Admin"
        userName={session.user.name}
        userRole="Super Admin"
      />
      <main className="flex-1 min-w-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
