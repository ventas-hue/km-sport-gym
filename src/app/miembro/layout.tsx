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
  ClipboardList,
  Target,
  Apple,
  Pill,
  Trophy,
  MessageCircle,
  User,
  Video as VideoIcon,
  QrCode,
  CreditCard,
} from "lucide-react";

const memberNav: NavItem[] = [
  { href: "/miembro", label: "Inicio", icon: LayoutDashboard },
  { href: "/miembro/qr", label: "Mi QR", icon: QrCode },
  { href: "/miembro/pagos", label: "Pagar", icon: CreditCard },
  { href: "/miembro/ficha", label: "Mi Ficha", icon: ClipboardList },
  { href: "/miembro/rutina", label: "Mi Rutina", icon: Dumbbell },
  { href: "/miembro/progreso", label: "Progreso", icon: Camera },
  { href: "/miembro/medidas", label: "Medidas", icon: Ruler },
  { href: "/miembro/wellness", label: "Wellness", icon: Heart },
  { href: "/miembro/check-in", label: "Check-in", icon: ClipboardCheck },
  { href: "/miembro/objetivos", label: "Objetivos", icon: Target },
  { href: "/miembro/nutricion", label: "Nutrición", icon: Apple },
  { href: "/miembro/suplementos", label: "Suplementos", icon: Pill },
  { href: "/miembro/records", label: "Records", icon: Trophy },
  { href: "/miembro/videos", label: "Videoteca", icon: VideoIcon },
  { href: "/miembro/mensajes", label: "Mensajes", icon: MessageCircle },
  { href: "/miembro/perfil", label: "Perfil", icon: User },
];

export default function MiembroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-theme min-h-screen bg-black text-white">
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
