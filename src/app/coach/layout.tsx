"use client";

import AuthProvider from "@/components/AuthProvider";
import AppShell from "@/components/AppShell";
import Sidebar, { type NavItem } from "@/components/Sidebar";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Dumbbell,
  ClipboardCheck,
  MessageCircle,
} from "lucide-react";

const coachNav: NavItem[] = [
  { href: "/coach", label: "Inicio", icon: LayoutDashboard },
  { href: "/coach/miembros", label: "Miembros", icon: Users },
  { href: "/coach/rutinas", label: "Rutinas", icon: BookOpen },
  { href: "/coach/ejercicios", label: "Ejercicios", icon: Dumbbell },
  { href: "/coach/check-ins", label: "Check-ins", icon: ClipboardCheck },
  { href: "/coach/mensajes", label: "Mensajes", icon: MessageCircle },
];

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-theme min-h-screen bg-[#f3f4f6] text-[#1f2937]">
      <AuthProvider>
        <AppShell requireRole="coach" sidebar={<Sidebar items={coachNav} homeHref="/coach" />}>
          {children}
        </AppShell>
      </AuthProvider>
    </div>
  );
}
