"use client";

import { useEffect, useState } from "react";
import { Ruler, Plus, Trash2, X, TrendingDown, TrendingUp } from "lucide-react";

interface Measurement {
  id: string;
  date: string;
  weight: number | null;
  bodyFatPct: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  leftArm: number | null;
  rightArm: number | null;
  leftThigh: number | null;
  rightThigh: number | null;
  neck: number | null;
  notes: string | null;
}

const FIELDS: Array<{ key: keyof Measurement; label: string; unit: string }> = [
  { key: "weight", label: "Peso", unit: "kg" },
  { key: "bodyFatPct", label: "% Grasa", unit: "%" },
  { key: "chest", label: "Pecho", unit: "cm" },
  { key: "waist", label: "Cintura", unit: "cm" },
  { key: "hips", label: "Cadera", unit: "cm" },
  { key: "leftArm", label: "Brazo izq", unit: "cm" },
  { key: "rightArm", label: "Brazo der", unit: "cm" },
  { key: "leftThigh", label: "Muslo izq", unit: "cm" },
  { key: "rightThigh", label: "Muslo der", unit: "cm" },
  { key: "neck", label: "Cuello", unit: "cm" },
];

const emptyForm = {
  date: new Date().toISOString().split("T")[0],
  weight: "",
  bodyFatPct: "",
  chest: "",
  waist: "",
  hips: "",
  leftArm: "",
  rightArm: "",
  leftThigh: "",
  rightThigh: "",
  neck: "",
  notes: "",
};

export default function MedidasPage() {
  const [items, setItems] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    fetch("/api/measurements")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/measurements", {
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
    if (!confirm("Eliminar este registro?")) return;
    await fetch(`/api/measurements/${id}`, { method: "DELETE" });
    load();
  };

  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];

  const delta = (key: keyof Measurement) => {
    if (!latest || !first || latest.id === first.id) return null;
    const l = latest[key] as number | null;
    const f = first[key] as number | null;
    if (l == null || f == null) return null;
    return +(l - f).toFixed(1);
  };

  // Simple mini chart for weight
  const weightSeries = sorted
    .filter((x) => x.weight != null)
    .map((x) => ({ date: x.date, value: x.weight as number }));

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Ruler className="text-orange-500" /> Medidas
          </h1>
          <p className="text-gray-500 mt-1">{items.length} registros</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setForm({ ...emptyForm, date: new Date().toISOString().split("T")[0] });
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm"
        >
          <Plus size={20} /> Nueva medida
        </button>
      </div>

      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {FIELDS.filter((f) => latest[f.key] != null).map((f) => {
            const d = delta(f.key);
            return (
              <div key={f.key} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  {f.label}
                </p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {latest[f.key]}
                  <span className="text-sm text-gray-400 ml-0.5">{f.unit}</span>
                </p>
                {d != null && d !== 0 && (
                  <p
                    className={`text-xs font-semibold mt-1 flex items-center gap-1 ${
                      d < 0 ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    {d < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                    {d > 0 ? "+" : ""}
                    {d}
                    {f.unit}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {weightSeries.length > 1 && <WeightChart series={weightSeries} />}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Ruler size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-semibold">Sin registros</p>
          <p className="text-sm text-gray-400 mt-1">
            Registra tus medidas cada semana para ver tu progreso
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
                  {FIELDS.map((f) => (
                    <th key={f.key} className="text-right px-3 py-3 font-semibold text-gray-600">
                      {f.label}
                    </th>
                  ))}
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {[...items].reverse().map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                      {new Date(m.date).toLocaleDateString("es-MX")}
                    </td>
                    {FIELDS.map((f) => (
                      <td
                        key={f.key}
                        className="px-3 py-3 text-right text-gray-600 whitespace-nowrap"
                      >
                        {m[f.key] != null ? `${m[f.key]}${f.unit}` : "-"}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => remove(m.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">Nueva medida</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {f.label} ({f.unit})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={(form as Record<string, string>)[f.key as string]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
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

function WeightChart({ series }: { series: Array<{ date: string; value: number }> }) {
  const w = 600;
  const h = 180;
  const pad = 30;
  const values = series.map((s) => s.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const xStep = (w - pad * 2) / Math.max(series.length - 1, 1);

  const points = series.map((s, i) => ({
    x: pad + i * xStep,
    y: h - pad - ((s.value - min) / range) * (h - pad * 2),
    value: s.value,
    date: s.date,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-2">Evolucion de peso</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${pathD} L${points[points.length - 1].x},${h - pad} L${points[0].x},${h - pad} Z`}
          fill="url(#grad)"
        />
        <path d={pathD} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3.5} fill="#f97316" />
          </g>
        ))}
        <text x={pad} y={h - 8} className="text-[10px] fill-gray-400">
          {series[0].date.slice(5)}
        </text>
        <text x={w - pad - 30} y={h - 8} className="text-[10px] fill-gray-400">
          {series[series.length - 1].date.slice(5)}
        </text>
      </svg>
    </div>
  );
}
