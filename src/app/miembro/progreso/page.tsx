"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Camera, Plus, Trash2, X, Info } from "lucide-react";

interface Photo {
  id: string;
  date: string;
  type: string;
  url: string;
  notes: string | null;
}

const TYPES = [
  { value: "front", label: "Frontal" },
  { value: "side", label: "Lateral" },
  { value: "back", label: "Espalda" },
];

const emptyForm = {
  date: new Date().toISOString().split("T")[0],
  type: "front",
  url: "",
  notes: "",
};

export default function ProgresoPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeType, setActiveType] = useState<"front" | "side" | "back">("front");
  const [compareIds, setCompareIds] = useState<[string | null, string | null]>([null, null]);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/progress-photos")
      .then((r) => r.json())
      .then((d) => setPhotos(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/progress-photos", {
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
    if (!confirm("Eliminar esta foto?")) return;
    await fetch(`/api/progress-photos/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = photos.filter((p) => p.type === activeType);
  const selectedA = filtered.find((p) => p.id === compareIds[0]);
  const selectedB = filtered.find((p) => p.id === compareIds[1]);

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Camera className="text-purple-500" /> Fotos de Progreso
          </h1>
          <p className="text-gray-500 mt-1">{photos.length} fotos</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setForm({ ...emptyForm, type: activeType });
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm"
        >
          <Plus size={20} /> Subir foto
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex gap-3">
        <Info size={18} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Como subir tu foto</p>
          <p className="text-blue-700/90 mt-1">
            Sube tu foto a Google Fotos, Dropbox o imgur y pega aqui el enlace directo (que
            termine en .jpg o .png). Pronto agregaremos upload directo.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveType(t.value as typeof activeType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeType === t.value
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t.label} ({photos.filter((p) => p.type === t.value).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Camera size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-semibold">Sin fotos aun</p>
          <p className="text-sm text-gray-400 mt-1">Sube tu primera foto hoy mismo</p>
        </div>
      ) : (
        <>
          {selectedA && selectedB && (
            <div className="grid grid-cols-2 gap-4 bg-white rounded-xl p-4 border border-gray-100">
              {[selectedA, selectedB].map((p, i) => (
                <div key={p.id}>
                  <p className="text-xs font-semibold text-orange-500 uppercase">
                    {i === 0 ? "Antes" : "Despues"} ·{" "}
                    {new Date(p.date).toLocaleDateString("es-MX")}
                  </p>
                  <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mt-2">
                    <Image
                      src={p.url}
                      alt="Foto de progreso"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((p) => {
              const isA = compareIds[0] === p.id;
              const isB = compareIds[1] === p.id;
              return (
                <div
                  key={p.id}
                  className="group relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-sm"
                >
                  <Image
                    src={p.url}
                    alt={`Foto ${p.type}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-x-0 top-0 p-2 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white font-semibold">
                      {new Date(p.date).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <button
                      onClick={() => remove(p.id)}
                      className="p-1 bg-red-500/80 text-white rounded hover:bg-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() =>
                          setCompareIds([isA ? null : p.id, compareIds[1] === p.id ? null : compareIds[1]])
                        }
                        className={`flex-1 text-[10px] py-1 rounded font-semibold uppercase ${
                          isA ? "bg-orange-500 text-white" : "bg-white/70 text-gray-900 hover:bg-white"
                        }`}
                      >
                        Antes
                      </button>
                      <button
                        onClick={() =>
                          setCompareIds([compareIds[0] === p.id ? null : compareIds[0], isB ? null : p.id])
                        }
                        className={`flex-1 text-[10px] py-1 rounded font-semibold uppercase ${
                          isB ? "bg-orange-500 text-white" : "bg-white/70 text-gray-900 hover:bg-white"
                        }`}
                      >
                        Despues
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Subir foto</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vista</label>
                  <select
                    required
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de la imagen</label>
                <input
                  type="url"
                  required
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold"
              >
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
