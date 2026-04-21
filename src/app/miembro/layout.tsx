"use client";

import AuthProvider from "@/components/AuthProvider";
import AppShell from "@/components/AppShell";
import Sidebar, { type NavItem } from "@/components/Sidebar";
import {
  LayoutDashboard,
  Dumbbell,
  Camera,
  Ruler,
  Heart,
  ClipboardCheck,
  Target,
  Apple,
  Pill,
  Trophy,
  MessageCircle,
  User,
} from "lucide-react";

const memberNav: NavItem[] = [
  { href: "/miembro", label: "Inicio", icon: LayoutDashboard },
  { href: "/miembro/rutina", label: "Mi Rutina", icon: Dumbbell },
  { href: "/miembro/progreso", label: "Progreso", icon: Camera },
  { href: "/miembro/medidas", label: "Medidas", icon: Ruler },
  { href: "/miembro/wellness", label: "Wellness", icon: Heart },
  { href: "/miembro/check-in", label: "Check-in", icon: ClipboardCheck },
  { href: "/miembro/objetivos", label: "Objetivos", icon: Target },
  { href: "/miembro/nutricion", label: "Nutricion", icon: Apple },
  { href: "/miembro/suplementos", label: "Suplementos", icon: Pill },
  { href: "/miembro/records", label: "Records", icon: Trophy },
  { href: "/miembro/mensajes", label: "Mensajes", icon: MessageCircle },
  { href: "/miembro/perfil", label: "Perfil", icon: User },
];

export default function MiembroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-theme min-h-screen bg-[#f3f4f6] text-[#1f2937]">
      <AuthProvider>
        <AppShell
          requireRole="member"
          sidebar={<Sidebar items={memberNav} homeHref="/miembro" />}
        >
          {children}
        </AppShell>
      </AuthProvider>
    </div>
  );
}
