"use client";

import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import {
  Dumbbell,
  Camera,
  Ruler,
  Heart,
  ClipboardCheck,
  Target,
  Apple,
  ArrowRight,
  Trophy,
} from "lucide-react";

const quickActions = [
  { href: "/miembro/rutina", label: "Mi Rutina", desc: "Ver y registrar entrenamiento", icon: Dumbbell, color: "bg-orange-500" },
  { href: "/miembro/medidas", label: "Medidas", desc: "Registrar peso y medidas", icon: Ruler, color: "bg-blue-500" },
  { href: "/miembro/progreso", label: "Fotos Progreso", desc: "Subir foto de hoy", icon: Camera, color: "bg-purple-500" },
  { href: "/miembro/wellness", label: "Wellness", desc: "Registro diario", icon: Heart, color: "bg-pink-500" },
  { href: "/miembro/check-in", label: "Check-in Semanal", desc: "Reporte de la semana", icon: ClipboardCheck, color: "bg-green-500" },
  { href: "/miembro/objetivos", label: "Objetivos", desc: "Ver tus metas", icon: Target, color: "bg-indigo-500" },
  { href: "/miembro/nutricion", label: "Nutricion", desc: "Plan y comidas", icon: Apple, color: "bg-emerald-500" },
  { href: "/miembro/records", label: "Records", desc: "Tus mejores marcas", icon: Trophy, color: "bg-amber-500" },
];

export default function MiembroHome() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in pt-8 lg:pt-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Hola {user?.firstName ?? ""} <span className="text-orange-500">👋</span>
        </h1>
        <p className="text-gray-500 mt-1">Bienvenido a tu espacio en LM Sport Gym</p>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-xl shadow-orange-500/20">
        <h2 className="text-xl font-bold">Listo para entrenar hoy?</h2>
        <p className="text-white/90 mt-1 text-sm">
          Abre tu rutina del dia y registra cada serie que completes.
        </p>
        <Link
          href="/miembro/rutina"
          className="mt-4 inline-flex items-center gap-2 bg-white text-orange-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-50 transition-colors"
        >
          <Dumbbell size={18} />
          Ir a mi rutina
          <ArrowRight size={16} />
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Accesos rapidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={`${a.color} w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                <a.icon size={20} />
              </div>
              <p className="font-semibold text-gray-900 text-sm">{a.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
