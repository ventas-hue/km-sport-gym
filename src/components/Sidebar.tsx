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
  Video as VideoIcon,
  ScanLine,
  MessageCircle,
  Newspaper,
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
  { href: "/admin/posts", label: "Publicaciones", icon: Newspaper },
  { href: "/admin/outreach", label: "A contactar hoy", icon: MessageCircle },
  { href: "/admin/attendance", label: "Asistencias", icon: ScanLine },
  { href: "/admin/clients", label: "Clientes", icon: Users },
  { href: "/admin/packages", label: "Paquetes", icon: Package },
  { href: "/admin/memberships", label: "Membresías", icon: CreditCard },
  { href: "/admin/day-passes", label: "Visitas", icon: CalendarCheck },
  { href: "/admin/sales", label: "Ventas", icon: ShoppingCart },
  { href: "/admin/purchases", label: "Compras", icon: Truck },
  { href: "/admin/expenses", label: "Gastos", icon: Receipt },
  { href: "/admin/exercises", label: "Ejercicios", icon: Dumbbell },
  { href: "/admin/routines", label: "Rutinas", icon: BookOpen },
  { href: "/admin/videos", label: "Videoteca", icon: VideoIcon },
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
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden h-10 w-10 flex items-center justify-center rounded-xl glass-strong text-white"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col
          border-r border-white/[0.06]
          bg-[rgba(10,10,12,0.72)] backdrop-blur-2xl backdrop-saturate-150
          transition-transform duration-300 ease-out
          lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-orange-500/30 blur-md" />
              <Image
                src="/logo.png"
                alt="LM Sport Gym"
                width={40}
                height={40}
                className="relative h-10 w-10 object-contain"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold tracking-tight text-white">
                LM Sport Gym
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-orange-400/90">
                by Karla Lizeth
              </span>
            </div>
          </div>
          {user && (
            <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-[11px] font-semibold text-white">
                {user.firstName?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium text-white truncate leading-tight">
                  {user.firstName}
                </div>
                <div className="text-[10px] text-white/50 capitalize tracking-wide">
                  {user.role}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== homeHref && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium
                  transition-all duration-200 ease-out group
                  ${
                    isActive
                      ? "bg-white/[0.07] text-white"
                      : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                  }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]" />
                )}
                <item.icon
                  size={16}
                  className={`shrink-0 transition-colors ${
                    isActive ? "text-orange-400" : "text-white/50 group-hover:text-white/80"
                  }`}
                  strokeWidth={1.75}
                />
                <span className="truncate tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-white/[0.06]">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
              text-[13px] font-medium text-white/60 hover:text-red-400 hover:bg-red-500/10
              transition-all duration-200 ease-out"
          >
            <LogOut size={15} strokeWidth={1.75} />
            <span>Cerrar sesión</span>
          </button>
          <p className="text-[10px] text-white/30 text-center mt-2 tracking-wide">
            LM Sport Gym · {new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </>
  );
}
