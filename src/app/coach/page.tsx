"use client";

import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Dumbbell,
  ClipboardCheck,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

const shortcuts = [
  { href: "/coach/miembros", label: "Mis Miembros", desc: "Ver lista y progreso", icon: Users, color: "bg-blue-500" },
  { href: "/coach/rutinas", label: "Rutinas", desc: "Crear y asignar", icon: BookOpen, color: "bg-orange-500" },
  { href: "/coach/ejercicios", label: "Ejercicios", desc: "Biblioteca", icon: Dumbbell, color: "bg-purple-500" },
  { href: "/coach/check-ins", label: "Check-ins", desc: "Revisar de la semana", icon: ClipboardCheck, color: "bg-green-500" },
  { href: "/coach/mensajes", label: "Mensajes", desc: "Conversaciones", icon: MessageCircle, color: "bg-pink-500" },
];

export default function CoachHome() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in pt-8 lg:pt-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Hola, Coach {user?.firstName ?? ""}
        </h1>
        <p className="text-gray-500 mt-1">Panel de coaching de LM Sport Gym</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shortcuts.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className={`${s.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
              <s.icon size={22} />
            </div>
            <p className="font-bold text-gray-900">{s.label}</p>
            <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            <div className="mt-3 text-orange-500 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Entrar <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
