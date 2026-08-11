import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default async function ShopLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role === "SUPER_ADMIN") redirect("/admin/dashboard");

  const isAdmin = session.user.role === "TENANT_ADMIN";

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: "dashboard" },
    { href: "/dashboard/categories", label: "Categories", icon: "categories" },
    { href: "/dashboard/products", label: "Products", icon: "products" },
    { href: "/dashboard/sales", label: "Sales", icon: "sales" },
    { href: "/dashboard/expenses", label: "Expenses", icon: "expenses" },
    ...(isAdmin
      ? [
          {
            href: "/dashboard/employees",
            label: "Employees",
            icon: "employees",
          },
          {
            href: "/dashboard/closing",
            label: "Monthly Closing",
            icon: "closing",
          },
          {
            href: "/dashboard/stock-count",
            label: "Stock Count",
            icon: "stock-count",
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        navItems={navItems}
        title="BetiShop"
        userName={session.user.name}
        userRole={isAdmin ? "Shop Admin" : "Employee"}
      />
      <main className="flex-1 min-w-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
