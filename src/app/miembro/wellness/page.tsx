"use client";

import { useEffect, useState, useCallback } from "react";
import { Heart, Droplets, Moon, Footprints, Zap, Brain } from "lucide-react";

interface Log {
  id: string;
  date: string;
  sleepHours: number | null;
  waterLiters: number | null;
  steps: number | null;
  mood: number | null;
  energy: number | null;
  stress: number | null;
  notes: string | null;
}

const todayStr = () => new Date().toISOString().split("T")[0];

export default function WellnessPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    date: todayStr(),
    sleepHours: "",
    waterLiters: "",
    steps: "",
    mood: 3,
    energy: 5,
    stress: 5,
    notes: "",
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/wellness");
    if (res.ok) {
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
      const today = todayStr();
      const todayLog = (data as Log[]).find((l) => l.date.startsWith(today));
      if (todayLog) {
        setForm({
          date: today,
          sleepHours: todayLog.sleepHours?.toString() ?? "",
          waterLiters: todayLog.waterLiters?.toString() ?? "",
          steps: todayLog.steps?.toString() ?? "",
          mood: todayLog.mood ?? 3,
          energy: todayLog.energy ?? 5,
          stress: todayLog.stress ?? 5,
          notes: todayLog.notes ?? "",
        });
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/wellness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Guardado");
      setTimeout(() => setMessage(""), 2000);
      load();
    }
  };

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Heart className="text-pink-500" /> Wellness Diario
        </h1>
        <p className="text-gray-500 mt-1">Como te fue hoy? Llena todos los campos que apliquen.</p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
            Fecha
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumberInput
            icon={Moon}
            label="Horas de sueno"
            unit="h"
            step="0.5"
            value={form.sleepHours}
            onChange={(v) => setForm({ ...form, sleepHours: v })}
          />
          <NumberInput
            icon={Droplets}
            label="Agua"
            unit="L"
            step="0.1"
            value={form.waterLiters}
            onChange={(v) => setForm({ ...form, waterLiters: v })}
          />
          <NumberInput
            icon={Footprints}
            label="Pasos"
            unit=""
            step="100"
            value={form.steps}
            onChange={(v) => setForm({ ...form, steps: v })}
          />
        </div>

        <Scale
          label="Animo"
          icon={Heart}
          min={1}
          max={5}
          value={form.mood}
          onChange={(v) => setForm({ ...form, mood: v })}
          color="pink"
          labels={["Mal", "Bajo", "Regular", "Bien", "Excelente"]}
        />

        <Scale
          label="Energia"
          icon={Zap}
          min={1}
          max={10}
          value={form.energy}
          onChange={(v) => setForm({ ...form, energy: v })}
          color="amber"
        />

        <Scale
          label="Estres"
          icon={Brain}
          min={1}
          max={10}
          value={form.stress}
          onChange={(v) => setForm({ ...form, stress: v })}
          color="blue"
        />

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
            Notas
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-2.5 rounded-lg font-semibold"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          {message && <span className="text-green-600 text-sm font-medium">{message}</span>}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Ultimos dias</h2>
        <div className="space-y-2">
          {logs.slice(0, 7).map((l) => (
            <div
              key={l.id}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center flex-wrap gap-4"
            >
              <p className="font-medium text-gray-700 min-w-[90px]">
                {new Date(l.date).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
              </p>
              {l.sleepHours && <span className="text-sm text-indigo-600">💤 {l.sleepHours}h</span>}
              {l.waterLiters && <span className="text-sm text-blue-500">💧 {l.waterLiters}L</span>}
              {l.steps && <span className="text-sm text-emerald-600">👟 {l.steps}</span>}
              {l.mood && <span className="text-sm text-pink-600">😊 {l.mood}/5</span>}
              {l.energy && <span className="text-sm text-amber-600">⚡ {l.energy}/10</span>}
              {l.stress && <span className="text-sm text-blue-500">🧠 {l.stress}/10</span>}
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-center text-gray-400 py-6">Sin registros aun</p>
          )}
        </div>
      </div>
    </div>
  );
}

function NumberInput({
  icon: Icon,
  label,
  unit,
  step,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  unit: string;
  step: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
        <Icon size={14} /> {label}
      </label>
      <div className="relative">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

const COLOR_STYLES: Record<string, { text: string; bg: string }> = {
  pink: { text: "text-pink-600", bg: "bg-pink-500" },
  amber: { text: "text-amber-600", bg: "bg-amber-500" },
  blue: { text: "text-blue-600", bg: "bg-blue-500" },
  orange: { text: "text-orange-600", bg: "bg-orange-500" },
};

function Scale({
  label,
  icon: Icon,
  min,
  max,
  value,
  onChange,
  color,
  labels,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  color: string;
  labels?: string[];
}) {
  const styles = COLOR_STYLES[color] ?? COLOR_STYLES.orange;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Icon size={14} /> {label}
        </label>
        <span className={`text-sm font-bold ${styles.text}`}>
          {value}/{max}
          {labels && ` · ${labels[value - 1]}`}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: max - min + 1 }).map((_, i) => {
          const n = min + i;
          const active = n <= value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`flex-1 h-9 rounded font-semibold text-sm transition-colors ${
                active ? `${styles.bg} text-white` : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
