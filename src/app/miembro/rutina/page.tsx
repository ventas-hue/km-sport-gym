"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dumbbell, ArrowRight, Video, Play, Layers } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  videoUrl: string | null;
}

interface WorkoutExercise {
  id: string;
  sets: number;
  reps: string;
  restSeconds: number | null;
  weight: number | null;
  notes: string | null;
  exercise: Exercise;
}

interface WorkoutDay {
  id: string;
  dayNumber: number;
  name: string;
  notes: string | null;
  videoUrl: string | null;
  exercises: WorkoutExercise[];
}

interface Workout {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  days: WorkoutDay[];
}

export default function MiRutinaPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingDayId, setStartingDayId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workouts")
      .then((r) => r.json())
      .then((data) => setWorkouts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const startSession = async (workoutId: string, dayId: string) => {
    setStartingDayId(dayId);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workoutId }),
    });
    if (res.ok) {
      const s = await res.json();
      window.location.href = `/miembro/rutina/sesion/${s.id}?dayId=${dayId}`;
    } else {
      setStartingDayId(null);
      alert("No se pudo iniciar la sesion");
    }
  };

  const active = workouts.filter((w) => w.isActive);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (active.length === 0) {
    return (
      <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Dumbbell className="text-orange-500" /> Mi Rutina
        </h1>
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Dumbbell size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-semibold">Aun no tienes rutina asignada</p>
          <p className="text-sm text-gray-400 mt-1">
            Karla te asignara una rutina pronto. Contactala por mensajes si tienes dudas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <Dumbbell className="text-orange-500" /> Mi Rutina
      </h1>

      {active.map((w) => (
        <div key={w.id} className="space-y-4">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-xl shadow-orange-500/20">
            <h2 className="text-2xl font-bold">{w.name}</h2>
            {w.description && <p className="text-white/90 mt-1">{w.description}</p>}
            <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
              <Layers size={16} />
              {w.days.length} dia{w.days.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {w.days.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-orange-500 font-bold">
                      Dia {d.dayNumber}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900">{d.name}</h3>
                    {d.notes && <p className="text-sm text-gray-500 mt-1">{d.notes}</p>}
                  </div>
                  {d.videoUrl && (
                    <a
                      href={d.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Ver video de rutina"
                    >
                      <Video size={18} />
                    </a>
                  )}
                </div>
                <div className="p-5 space-y-3">
                  {d.exercises.map((we) => (
                    <div key={we.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {we.exercise.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {we.sets} x {we.reps}
                          {we.weight ? ` · ${we.weight}kg` : ""}
                          {we.restSeconds ? ` · ${we.restSeconds}s descanso` : ""}
                        </p>
                      </div>
                      {we.exercise.videoUrl && (
                        <a
                          href={we.exercise.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors shrink-0"
                          title="Video"
                        >
                          <Video size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => startSession(w.id, d.id)}
                    disabled={startingDayId === d.id}
                    className="w-full mt-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Play size={16} />
                    {startingDayId === d.id ? "Iniciando..." : "Empezar entrenamiento"}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <Link
          href="/miembro/historial"
          className="text-sm text-gray-500 hover:text-orange-500 font-medium"
        >
          Ver historial de entrenamientos
        </Link>
      </div>
    </div>
  );
}
