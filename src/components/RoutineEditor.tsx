"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  X,
  GripVertical,
  User as UserIcon,
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  videoUrl: string | null;
}

interface ExerciseRow {
  id?: string;
  exerciseId: string;
  sets: number;
  reps: string;
  weight: number | null;
  restSeconds: number | null;
  notes: string;
  order: number;
  exercise?: Exercise;
}

interface DayRow {
  id?: string;
  name: string;
  notes: string;
  dayNumber: number;
  exercises: ExerciseRow[];
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface Props {
  workoutId: string;
  backHref: string;
}

export default function RoutineEditor({ workoutId, backHref }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [days, setDays] = useState<DayRow[]>([]);
  const [exerciseLib, setExerciseLib] = useState<Exercise[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pickerForDay, setPickerForDay] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerGroup, setPickerGroup] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [wRes, eRes, cRes] = await Promise.all([
      fetch(`/api/workouts/${workoutId}`),
      fetch("/api/exercises"),
      fetch("/api/clients?search="),
    ]);
    if (wRes.ok) {
      const w = await wRes.json();
      setName(w.name ?? "");
      setDescription(w.description ?? "");
      setClientId(w.clientId ?? "");
      setDays(
        (w.days ?? []).map((d: { id: string; name: string; notes: string | null; dayNumber: number; exercises: Array<{ id: string; exerciseId: string; sets: number; reps: string; weight: number | null; restSeconds: number | null; notes: string | null; order: number; exercise: Exercise }> }) => ({
          id: d.id,
          name: d.name,
          notes: d.notes ?? "",
          dayNumber: d.dayNumber,
          exercises: (d.exercises ?? []).map((e) => ({
            id: e.id,
            exerciseId: e.exerciseId,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight,
            restSeconds: e.restSeconds,
            notes: e.notes ?? "",
            order: e.order,
            exercise: e.exercise,
          })),
        }))
      );
    }
    if (eRes.ok) setExerciseLib(await eRes.json());
    if (cRes.ok) setClients(await cRes.json());
    setLoading(false);
  }, [workoutId]);

  useEffect(() => {
    load();
  }, [load]);

  const addDay = () => {
    setDays((ds) => [
      ...ds,
      {
        name: `Dia ${ds.length + 1}`,
        notes: "",
        dayNumber: ds.length + 1,
        exercises: [],
      },
    ]);
  };

  const removeDay = (i: number) => {
    if (!confirm("Eliminar este dia?")) return;
    setDays((ds) => ds.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, dayNumber: idx + 1 })));
  };

  const updateDay = (i: number, patch: Partial<DayRow>) => {
    setDays((ds) => ds.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  };

  const addExerciseToDay = (dayIdx: number, ex: Exercise) => {
    setDays((ds) =>
      ds.map((d, idx) =>
        idx === dayIdx
          ? {
              ...d,
              exercises: [
                ...d.exercises,
                {
                  exerciseId: ex.id,
                  sets: 3,
                  reps: "10",
                  weight: null,
                  restSeconds: 90,
                  notes: "",
                  order: d.exercises.length,
                  exercise: ex,
                },
              ],
            }
          : d
      )
    );
    setPickerForDay(null);
    setPickerSearch("");
    setPickerGroup("");
  };

  const updateExercise = (dayIdx: number, exIdx: number, patch: Partial<ExerciseRow>) => {
    setDays((ds) =>
      ds.map((d, idx) =>
        idx === dayIdx
          ? {
              ...d,
              exercises: d.exercises.map((e, ei) => (ei === exIdx ? { ...e, ...patch } : e)),
            }
          : d
      )
    );
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    setDays((ds) =>
      ds.map((d, idx) =>
        idx === dayIdx
          ? { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIdx) }
          : d
      )
    );
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/workouts/${workoutId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        clientId: clientId || null,
        days: days.map((d, di) => ({
          dayNumber: di + 1,
          name: d.name,
          notes: d.notes,
          exercises: d.exercises.map((e, ei) => ({
            exerciseId: e.exerciseId,
            sets: Number(e.sets) || 3,
            reps: e.reps || "10",
            weight: e.weight,
            restSeconds: e.restSeconds,
            notes: e.notes,
            order: ei,
          })),
        })),
      }),
    });
    setSaving(false);
    if (res.ok) {
      router.push(backHref);
    } else {
      alert("Error al guardar");
    }
  };

  const filteredLib = exerciseLib.filter((ex) => {
    const matchSearch = !pickerSearch || ex.name.toLowerCase().includes(pickerSearch.toLowerCase());
    const matchGroup = !pickerGroup || ex.muscleGroup === pickerGroup;
    return matchSearch && matchGroup;
  });

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pt-8 lg:pt-0 pb-12">
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} /> Volver
        </Link>
        <div className="flex-1" />
        <button
          onClick={save}
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div>
          <label className="block text-xs uppercase font-semibold text-gray-500 mb-1.5 tracking-wider">
            Nombre de la rutina
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-2xl font-bold border-b-2 border-gray-200 focus:border-orange-500 focus:outline-none pb-2"
            placeholder="Ej: Full Body 3 dias"
          />
        </div>
        <div>
          <label className="block text-xs uppercase font-semibold text-gray-500 mb-1.5 tracking-wider">
            Descripcion
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            placeholder="Objetivo, nivel, duracion..."
          />
        </div>
        <div>
          <label className="block text-xs uppercase font-semibold text-gray-500 mb-1.5 tracking-wider flex items-center gap-1.5">
            <UserIcon size={12} /> Asignar a cliente (opcional)
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            <option value="">— Plantilla (sin asignar) —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {days.map((day, di) => (
          <div key={di} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-100">
              <span className="text-orange-500 font-bold text-lg">#{di + 1}</span>
              <input
                value={day.name}
                onChange={(e) => updateDay(di, { name: e.target.value })}
                className="flex-1 font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 rounded px-2 py-1"
                placeholder="Nombre del dia"
              />
              <button
                onClick={() => removeDay(di)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar dia"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {day.exercises.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">
                  Sin ejercicios — usa el boton + para agregar
                </p>
              ) : (
                day.exercises.map((ex, ei) => (
                  <div
                    key={ei}
                    className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <GripVertical className="text-gray-300 col-span-1" size={16} />
                    <div className="col-span-11 sm:col-span-4">
                      <p className="font-medium text-gray-900 text-sm">
                        {ex.exercise?.name ?? "???"}
                      </p>
                      {ex.exercise?.muscleGroup && (
                        <p className="text-xs text-orange-500">{ex.exercise.muscleGroup}</p>
                      )}
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[10px] uppercase font-semibold text-gray-400">
                        Series
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={ex.sets}
                        onChange={(e) =>
                          updateExercise(di, ei, { sets: parseInt(e.target.value) || 1 })
                        }
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[10px] uppercase font-semibold text-gray-400">
                        Reps
                      </label>
                      <input
                        value={ex.reps}
                        onChange={(e) => updateExercise(di, ei, { reps: e.target.value })}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        placeholder="10 o 8-12"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[10px] uppercase font-semibold text-gray-400">
                        Descanso (s)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={ex.restSeconds ?? ""}
                        onChange={(e) =>
                          updateExercise(di, ei, {
                            restSeconds: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                    <div className="col-span-11 sm:col-span-1 text-right">
                      <button
                        onClick={() => removeExercise(di, ei)}
                        className="p-1 text-red-400 hover:bg-red-50 rounded transition-colors"
                        title="Quitar"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="col-span-12">
                      <input
                        value={ex.notes}
                        onChange={(e) => updateExercise(di, ei, { notes: e.target.value })}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        placeholder="Notas (opcional)"
                      />
                    </div>
                  </div>
                ))
              )}
              <button
                onClick={() => setPickerForDay(di)}
                className="w-full border-2 border-dashed border-gray-200 hover:border-orange-400 text-gray-500 hover:text-orange-500 rounded-lg py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Agregar ejercicio
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addDay}
          className="w-full border-2 border-dashed border-gray-200 hover:border-orange-400 text-gray-500 hover:text-orange-500 rounded-xl py-4 font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Agregar dia
        </button>
      </div>

      {/* Exercise picker modal */}
      {pickerForDay !== null && (
        <div className="modal-overlay" onClick={() => setPickerForDay(null)}>
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Elegir ejercicio</h3>
              <button
                onClick={() => setPickerForDay(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              <input
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Buscar..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <select
                value={pickerGroup}
                onChange={(e) => setPickerGroup(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="">Todos</option>
                <option value="chest">Pecho</option>
                <option value="back">Espalda</option>
                <option value="legs">Piernas</option>
                <option value="shoulders">Hombros</option>
                <option value="arms">Brazos</option>
                <option value="core">Core</option>
                <option value="cardio">Cardio</option>
              </select>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 -mx-2 px-2">
              {filteredLib.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => addExerciseToDay(pickerForDay, ex)}
                  className="w-full text-left p-3 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                >
                  <p className="font-medium text-gray-900 text-sm">{ex.name}</p>
                  <p className="text-xs text-orange-500">{ex.muscleGroup}</p>
                </button>
              ))}
              {filteredLib.length === 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">Sin resultados</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
