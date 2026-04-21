"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Plus, User as UserIcon, Layers, Trash2 } from "lucide-react";

interface Workout {
  id: string;
  name: string;
  description: string | null;
  isTemplate: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  client: { id: string; firstName: string; lastName: string } | null;
  coach: { id: string; firstName: string; lastName: string };
  days: Array<{ id: string; exercises: Array<unknown> }>;
}

interface Props {
  basePath: string;
}

export default function RoutinesList({ basePath }: Props) {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<"all" | "templates" | "assigned">("all");

  useEffect(() => {
    fetch("/api/workouts")
      .then((r) => r.json())
      .then((data) => setWorkouts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const createNew = async () => {
    setCreating(true);
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Nueva rutina", days: [] }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`${basePath}/${data.id}`);
    }
    setCreating(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminar esta rutina?")) return;
    const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
    if (res.ok) setWorkouts((ws) => ws.filter((w) => w.id !== id));
  };

  const filtered = workouts.filter((w) => {
    if (filter === "templates") return w.isTemplate;
    if (filter === "assigned") return !w.isTemplate;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="text-orange-500" /> Rutinas
          </h1>
          <p className="text-gray-500 mt-1">{workouts.length} rutinas</p>
        </div>
        <button
          onClick={createNew}
          disabled={creating}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus size={20} /> {creating ? "Creando..." : "Nueva Rutina"}
        </button>
      </div>

      <div className="flex gap-2">
        {(["all", "templates", "assigned"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f === "all" ? "Todas" : f === "templates" ? "Plantillas" : "Asignadas"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
          <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
          <p>No hay rutinas</p>
          <button
            onClick={createNew}
            className="mt-4 text-orange-500 hover:text-orange-600 font-medium"
          >
            Crear la primera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <Link href={`${basePath}/${w.id}`} className="flex-1">
                  <h3 className="font-bold text-gray-900 hover:text-orange-600 transition-colors">
                    {w.name}
                  </h3>
                  {w.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {w.description}
                    </p>
                  )}
                </Link>
                <button
                  onClick={() => remove(w.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Layers size={14} /> {w.days.length} dia{w.days.length !== 1 ? "s" : ""}
                </span>
                {w.client ? (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <UserIcon size={14} /> {w.client.firstName} {w.client.lastName}
                  </span>
                ) : (
                  <span className="text-orange-500 font-medium">Plantilla</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
