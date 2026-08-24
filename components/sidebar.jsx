"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Tag,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  CalendarCheck,
  ClipboardCheck,
  Truck,
  PackageCheck,
  Boxes,
  MapPin,
} from "lucide-react";
import { signOut } from "next-auth/react";

const ICONS = {
  dashboard: LayoutDashboard,
  "clipboard-list": ClipboardList,
  categories: Tag,
  products: Package,
  sales: ShoppingCart,
  expenses: Receipt,
  employees: Users,
  closing: CalendarCheck,
  "stock-count": ClipboardCheck,
  suppliers: Truck,
  grn: PackageCheck,
  stock: Boxes,
  stores: MapPin,
};

export default function Sidebar({
  navItems,
  title = "BetiShop",
  userName,
  userRole,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-slate-600 hover:text-slate-900">
          <Menu size={22} />
        </button>
        <span className="font-semibold text-slate-800">{title}</span>
        <div className="w-[22px]" />
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 h-full z-50 w-64
          bg-slate-900 text-slate-100 flex flex-col shrink-0
          transition-all duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          ${collapsed ? "md:w-[76px]" : "md:w-64"}
        `}>
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800 shrink-0">
          {!collapsed && (
            <span className="font-semibold text-lg tracking-tight">
              {title}
            </span>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden md:flex text-slate-400 hover:text-white">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = ICONS[item.icon] ?? LayoutDashboard;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-900 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}>
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3 shrink-0">
          {!collapsed && (
            <div className="mb-2 px-1">
              <p className="text-sm font-medium text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-slate-400">{userRole}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white w-full">
            <LogOut size={18} />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
