"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Clock, Dumbbell, CheckCircle2, Circle } from "lucide-react";

interface Session {
  id: string;
  date: string;
  completed: boolean;
  durationMin: number | null;
  totalVolume: number | null;
  totalSets: number | null;
  rating: number | null;
  notes: string | null;
  workout: { id: string; name: string } | null;
  setLogs: Array<{ id: string; exercise: { name: string } }>;
}

export default function HistorialPage() {
  const [items, setItems] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const completed = items.filter((s) => s.completed);
  const thisMonth = completed.filter(
    (s) => new Date(s.date).getMonth() === new Date().getMonth()
  );
  const totalVolume = thisMonth.reduce((sum, s) => sum + (s.totalVolume ?? 0), 0);

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <History className="text-blue-500" /> Historial de Entrenamientos
        </h1>
        <p className="text-gray-500 mt-1">
          {completed.length} sesiones completadas · {thisMonth.length} este mes
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatBox label="Sesiones totales" value={completed.length.toString()} icon={Dumbbell} />
        <StatBox label="Este mes" value={thisMonth.length.toString()} icon={History} />
        <StatBox label="Volumen mes" value={`${Math.round(totalVolume)} kg`} icon={CheckCircle2} />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <History size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-semibold">Sin sesiones registradas</p>
          <Link href="/miembro/rutina" className="text-orange-500 text-sm mt-2 inline-block">
            Ir a mi rutina
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((s) => {
            const exercises = Array.from(new Set(s.setLogs.map((l) => l.exercise.name)));
            return (
              <div
                key={s.id}
                className={`bg-white rounded-xl p-4 border shadow-sm flex items-center gap-4 ${
                  s.completed ? "border-green-200" : "border-gray-100"
                }`}
              >
                {s.completed ? (
                  <CheckCircle2 className="text-green-500 shrink-0" size={22} />
                ) : (
                  <Circle className="text-gray-300 shrink-0" size={22} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">
                      {s.workout?.name ?? "Entrenamiento"}
                    </p>
                    {s.rating && (
                      <span className="text-xs text-orange-600 font-semibold">
                        {"★".repeat(s.rating)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(s.date).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {exercises.length > 0 && ` · ${exercises.length} ejercicios`}
                  </p>
                  {exercises.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {exercises.slice(0, 3).join(", ")}
                      {exercises.length > 3 && ` +${exercises.length - 3}`}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {s.durationMin != null && (
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-1 justify-end">
                      <Clock size={14} />
                      {s.durationMin} min
                    </p>
                  )}
                  {s.totalVolume != null && (
                    <p className="text-xs text-gray-500">
                      {Math.round(s.totalVolume)}kg · {s.totalSets} sets
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-orange-50 text-orange-500 p-2 rounded-lg">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
