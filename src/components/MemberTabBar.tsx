"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Dumbbell,
  Apple,
  QrCode,
  User,
  type LucideIcon,
} from "lucide-react";

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: (p: string) => boolean;
}

const TABS: Tab[] = [
  { href: "/miembro", label: "Hoy", icon: Home, match: (p) => p === "/miembro" },
  { href: "/miembro/rutina", label: "Rutina", icon: Dumbbell },
  { href: "/miembro/qr", label: "QR", icon: QrCode },
  { href: "/miembro/nutricion", label: "Comer", icon: Apple },
  { href: "/miembro/perfil", label: "Perfil", icon: User },
];

export default function MemberTabBar() {
  const pathname = usePathname();
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-black/80 backdrop-blur-2xl backdrop-saturate-150"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegación principal"
    >
      <div className="grid grid-cols-5 h-16">
        {TABS.map((t) => {
          const active = t.match ? t.match(pathname) : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center justify-center gap-0.5 transition ${
                active ? "text-orange-400" : "text-white/50 active:text-white/80"
              }`}
            >
              <t.icon size={20} strokeWidth={active ? 2.2 : 1.75} />
              <span className="text-[10px] font-medium tracking-tight">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
