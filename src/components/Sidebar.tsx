"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  CalendarCheck,
  ShoppingCart,
  Truck,
  Receipt,
  Menu,
  X,
  LogOut,
  Dumbbell,
  BookOpen,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clientes", icon: Users },
  { href: "/admin/packages", label: "Paquetes", icon: Package },
  { href: "/admin/memberships", label: "Membresias", icon: CreditCard },
  { href: "/admin/day-passes", label: "Visitas", icon: CalendarCheck },
  { href: "/admin/sales", label: "Ventas", icon: ShoppingCart },
  { href: "/admin/purchases", label: "Compras", icon: Truck },
  { href: "/admin/expenses", label: "Gastos", icon: Receipt },
  { href: "/admin/exercises", label: "Ejercicios", icon: Dumbbell },
  { href: "/admin/routines", label: "Rutinas", icon: BookOpen },
  { href: "/admin/coaches", label: "Coaches", icon: UserCog },
];

interface SidebarProps {
  items?: NavItem[];
  homeHref?: string;
}

export default function Sidebar({ items, homeHref = "/admin" }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();
  const navItems = items ?? adminNav;

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#1e1e2e] text-white p-2 rounded-lg shadow-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#1e1e2e] text-white z-40 transition-transform duration-300 lg:translate-x-0 overflow-y-auto pb-24 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="LM Sport Gym"
              width={72}
              height={72}
              className="mb-2"
            />
            <h1 className="text-lg font-bold tracking-tight">LM SPORT GYM</h1>
            <p className="text-[10px] text-orange-400 font-semibold italic mt-0.5 uppercase tracking-widest">
              Donde se hacen los campeones
            </p>
            {user && (
              <p className="text-xs text-gray-400 mt-3">
                {user.firstName} <span className="text-orange-400">·</span>{" "}
                <span className="capitalize">{user.role}</span>
              </p>
            )}
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== homeHref && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#1e1e2e]">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Cerrar Sesion</span>
          </button>
          <p className="text-xs text-gray-600 text-center mt-2">
            LM Sport Gym &copy; {new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </>
  );
}
