"use client";

import { useEffect, useState, useCallback } from "react";
import { Pill, Plus, Trash2, Check, X } from "lucide-react";

interface Supplement {
  id: string;
  name: string;
  dose: string | null;
  timing: string | null;
  notes: string | null;
  logs: Array<{ id: string; taken: boolean; date: string }>;
}

const emptyForm = { name: "", dose: "", timing: "", notes: "" };

export default function SuplementosPage() {
  const [items, setItems] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/supplements")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (sup: Supplement) => {
    const takenNow = sup.logs[0]?.taken ?? false;
    await fetch(`/api/supplements/${sup.id}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taken: !takenNow }),
    });
    load();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/supplements", {
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

  const remove = async (id: string) => {
    if (!confirm("Eliminar este suplemento?")) return;
    await fetch(`/api/supplements/${id}`, { method: "DELETE" });
    load();
  };

  const takenCount = items.filter((s) => s.logs[0]?.taken).length;

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Pill className="text-teal-500" /> Suplementos
          </h1>
          <p className="text-gray-500 mt-1">
            {items.length > 0
              ? `${takenCount}/${items.length} tomados hoy`
              : "Sin suplementos registrados"}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setForm(emptyForm);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm"
        >
          <Plus size={20} /> Agregar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Pill size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-semibold">Sin suplementos</p>
          <p className="text-sm text-gray-400 mt-1">Agrega los que Karla te recomendo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => {
            const taken = s.logs[0]?.taken ?? false;
            return (
              <div
                key={s.id}
                className={`bg-white rounded-xl border shadow-sm transition-colors ${
                  taken ? "border-green-300 bg-green-50/50" : "border-gray-100"
                }`}
              >
                <div className="p-4 flex items-center gap-3">
                  <button
                    onClick={() => toggle(s)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                      taken
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    <Check size={18} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{s.name}</p>
                    <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                      {s.dose && <span>{s.dose}</span>}
                      {s.timing && <span>· {s.timing}</span>}
                    </div>
                    {s.notes && <p className="text-xs text-gray-500 mt-0.5">{s.notes}</p>}
                  </div>
                  <button
                    onClick={() => remove(s.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
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
              <h2 className="text-xl font-bold">Nuevo suplemento</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Proteina whey"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosis</label>
                <input
                  value={form.dose}
                  onChange={(e) => setForm({ ...form, dose: e.target.value })}
                  placeholder="30g / 1 scoop"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuando tomarlo</label>
                <input
                  value={form.timing}
                  onChange={(e) => setForm({ ...form, timing: e.target.value })}
                  placeholder="Despues de entrenar"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold"
              >
                Agregar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
