"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Dumbbell,
  Plus,
  Save,
  Trash2,
  Trophy,
  Video,
} from "lucide-react";
import { estimate1RM } from "@/lib/fitness";

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
  weight: number | null;
  restSeconds: number | null;
  notes: string | null;
  exercise: Exercise;
}

interface WorkoutDay {
  id: string;
  dayNumber: number;
  name: string;
  exercises: WorkoutExercise[];
}

interface Workout {
  id: string;
  name: string;
  days: WorkoutDay[];
}

interface SetLog {
  id: string;
  workoutExerciseId: string | null;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
  rpe: number | null;
  exercise: Exercise;
}

interface Session {
  id: string;
  date: string;
  completed: boolean;
  durationMin: number | null;
  rating: number | null;
  notes: string | null;
  workout: Workout | null;
  setLogs: SetLog[];
}

export default function SesionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dayId = searchParams.get("dayId");

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [rating, setRating] = useState(4);
  const [notes, setNotes] = useState("");
  const [elapsedSec, setElapsedSec] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch(`/api/sessions/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSession(data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Timer for duration
  useEffect(() => {
    if (!session) return;
    const start = new Date(session.date).getTime();
    const update = () => setElapsedSec(Math.floor((Date.now() - start) / 1000));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [session]);

  const currentDay =
    session?.workout?.days.find((d) => d.id === dayId) ?? session?.workout?.days[0];

  const getSetsFor = (we: WorkoutExercise): SetLog[] =>
    (session?.setLogs ?? []).filter((s) => s.workoutExerciseId === we.id);

  const logSet = async (we: WorkoutExercise, setNumber: number, weight: number, reps: number, rpe: number | null) => {
    const res = await fetch(`/api/sessions/${id}/sets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workoutExerciseId: we.id,
        exerciseId: we.exercise.id,
        setNumber,
        weight,
        reps,
        rpe,
      }),
    });
    if (res.ok) load();
  };

  const removeSet = async (setId: string) => {
    await fetch(`/api/sessions/${id}/sets?setId=${setId}`, { method: "DELETE" });
    load();
  };

  const finish = async () => {
    setFinishing(true);
    const totalVolume = (session?.setLogs ?? []).reduce(
      (sum, s) => sum + s.weight * s.reps,
      0
    );
    const totalSets = (session?.setLogs ?? []).length;

    const res = await fetch(`/api/sessions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completed: true,
        durationMin: Math.ceil(elapsedSec / 60),
        totalVolume,
        totalSets,
        rating,
        notes,
      }),
    });
    setFinishing(false);
    if (res.ok) {
      router.push("/miembro/rutina");
      router.refresh();
    } else {
      alert("Error al finalizar");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!session) return <p>Sesion no encontrada</p>;

  const totalLogs = session.setLogs.length;
  const totalVol = session.setLogs.reduce((s, x) => s + x.weight * x.reps, 0);

  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
  const ss = String(elapsedSec % 60).padStart(2, "0");

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in pb-24 lg:pb-8">
      <div className="flex items-center justify-between">
        <Link
          href="/miembro/rutina"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} /> Mi Rutina
        </Link>
        <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 font-mono text-sm">
          <Clock size={14} />
          {mm}:{ss}
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
        <p className="text-xs uppercase tracking-wider opacity-80">Entrenando</p>
        <h1 className="text-2xl font-bold">{currentDay?.name ?? session.workout?.name}</h1>
        <div className="mt-3 flex items-center gap-4 text-sm text-white/90">
          <span className="flex items-center gap-1">
            <Dumbbell size={14} /> {totalLogs} sets
          </span>
          <span>·</span>
          <span>{totalVol.toFixed(0)} kg volumen total</span>
        </div>
      </div>

      <div className="space-y-4">
        {currentDay?.exercises.map((we) => (
          <ExerciseTracker
            key={we.id}
            we={we}
            existingSets={getSetsFor(we)}
            onLog={logSet}
            onRemove={removeSet}
          />
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900">Terminar sesion</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Como fue tu entrenamiento? ({rating}/5)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                  rating === n ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
            placeholder="Como te sentiste, ajustes, observaciones..."
          />
        </div>

        <button
          onClick={finish}
          disabled={finishing || totalLogs === 0}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20"
        >
          <CheckCircle2 size={18} />
          {finishing ? "Finalizando..." : "Finalizar entrenamiento"}
        </button>
        {totalLogs === 0 && (
          <p className="text-xs text-center text-gray-400">Registra al menos un set para finalizar</p>
        )}
      </div>
    </div>
  );
}

interface TrackerProps {
  we: WorkoutExercise;
  existingSets: SetLog[];
  onLog: (we: WorkoutExercise, setNumber: number, weight: number, reps: number, rpe: number | null) => void;
  onRemove: (setId: string) => void;
}

function ExerciseTracker({ we, existingSets, onLog, onRemove }: TrackerProps) {
  const [weight, setWeight] = useState<string>(we.weight ? String(we.weight) : "");
  const [reps, setReps] = useState<string>("");
  const [rpe, setRpe] = useState<string>("");

  const submitSet = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (!w || !r) {
      alert("Ingresa peso y reps");
      return;
    }
    const rpeN = rpe ? parseFloat(rpe) : null;
    onLog(we, existingSets.length + 1, w, r, rpeN);
    setReps("");
    if (rpe) setRpe("");
  };

  const bestSet = existingSets.reduce(
    (best, s) => {
      const est = estimate1RM(s.weight, s.reps);
      return est > best.est ? { est, set: s } : best;
    },
    { est: 0, set: null as SetLog | null }
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900">{we.exercise.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Objetivo: {we.sets} x {we.reps}
            {we.weight ? ` @ ${we.weight}kg` : ""}
          </p>
          {we.notes && <p className="text-xs text-orange-500 mt-1">{we.notes}</p>}
        </div>
        {we.exercise.videoUrl && (
          <a
            href={we.exercise.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shrink-0"
          >
            <Video size={16} />
          </a>
        )}
      </div>

      <div className="p-4">
        {existingSets.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {existingSets.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-2 text-sm bg-green-50 px-3 py-2 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-600" />
                  <span className="font-semibold text-green-700">Set {s.setNumber}</span>
                </div>
                <span className="text-gray-700">
                  {s.weight}kg x {s.reps} reps
                  {s.rpe ? ` · RPE ${s.rpe}` : ""}
                </span>
                <button
                  onClick={() => onRemove(s.id)}
                  className="p-1 text-red-400 hover:bg-red-50 rounded"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {bestSet.set && (
              <div className="flex items-center gap-2 text-xs text-orange-600 font-medium px-3 pt-1">
                <Trophy size={12} /> Mejor set: {bestSet.set.weight}kg x {bestSet.set.reps} (est.
                1RM: {bestSet.est}kg)
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
          <div>
            <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-1">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-1">
              Reps
            </label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-1">
              RPE (opcional)
            </label>
            <input
              type="number"
              step="0.5"
              min={1}
              max={10}
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              placeholder="1-10"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={submitSet}
              className="h-[38px] bg-orange-500 hover:bg-orange-600 text-white px-3 rounded-lg flex items-center gap-1 text-sm font-semibold transition-colors"
            >
              <Plus size={16} />
              Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
