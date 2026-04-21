"use client";

import { useEffect, useState, useCallback } from "react";
import { Target, Plus, Trash2, X, Check, TrendingUp, TrendingDown } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  startValue: number | null;
  currentValue: number | null;
  targetValue: number | null;
  unit: string | null;
  direction: string;
  deadline: string | null;
  status: string;
  createdAt: string;
  milestones: Array<{ id: string; title: string; reached: boolean }>;
}

const emptyForm = {
  title: "",
  description: "",
  startValue: "",
  targetValue: "",
  unit: "kg",
  direction: "decrease",
  deadline: "",
};

export default function ObjetivosPage() {
  const [items, setItems] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/goals")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm(emptyForm);
      load();
    }
  };

  const updateGoal = async (id: string, patch: Partial<Goal>) => {
    await fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminar este objetivo?")) return;
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    load();
  };

  const progress = (g: Goal): number => {
    if (g.startValue == null || g.targetValue == null || g.currentValue == null) return 0;
    const total = Math.abs(g.targetValue - g.startValue);
    if (total === 0) return 100;
    const done = Math.abs(g.currentValue - g.startValue);
    return Math.min(100, Math.max(0, (done / total) * 100));
  };

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="text-indigo-500" /> Mis Objetivos
          </h1>
          <p className="text-gray-500 mt-1">{items.length} objetivos</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setForm(emptyForm);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm"
        >
          <Plus size={20} /> Nuevo objetivo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Target size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-semibold">Aun no tienes objetivos</p>
          <p className="text-sm text-gray-400 mt-1">Define metas concretas para medir tu progreso</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((g) => {
            const p = progress(g);
            const Icon = g.direction === "decrease" ? TrendingDown : TrendingUp;
            return (
              <div
                key={g.id}
                className={`bg-white rounded-xl p-5 border shadow-sm ${
                  g.status === "achieved"
                    ? "border-green-300 bg-green-50/50"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        size={16}
                        className={g.direction === "decrease" ? "text-blue-500" : "text-green-500"}
                      />
                      <h3 className="font-bold text-gray-900">{g.title}</h3>
                    </div>
                    {g.description && (
                      <p className="text-sm text-gray-500">{g.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {g.status !== "achieved" && (
                      <button
                        onClick={() => updateGoal(g.id, { status: "achieved" })}
                        className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg"
                        title="Marcar como alcanzado"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => remove(g.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <p className="text-2xl font-bold text-gray-900">
                      {g.currentValue ?? "-"}
                      <span className="text-sm font-normal text-gray-400 ml-1">{g.unit}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Meta: <strong className="text-gray-900">{g.targetValue}{g.unit}</strong>
                    </p>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(p)}% completado
                    {g.startValue != null && (
                      <span className="ml-2">
                        · desde {g.startValue}
                        {g.unit}
                      </span>
                    )}
                  </p>
                </div>

                {g.deadline && (
                  <p className="text-xs text-gray-500 mt-3">
                    Fecha limite: {new Date(g.deadline).toLocaleDateString("es-MX")}
                  </p>
                )}

                {g.status !== "achieved" && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Nuevo valor actual"
                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      onBlur={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) {
                          updateGoal(g.id, { currentValue: v });
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Nuevo objetivo</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titulo</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Bajar a 60kg"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Actual</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.startValue}
                    onChange={(e) => setForm({ ...form, startValue: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Meta</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.targetValue}
                    onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unidad</label>
                  <input
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Direccion</label>
                <select
                  value={form.direction}
                  onChange={(e) => setForm({ ...form, direction: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="decrease">Quiero bajar</option>
                  <option value="increase">Quiero subir</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha limite</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold"
              >
                Crear objetivo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
