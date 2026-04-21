"use client";

import { useEffect, useState, useCallback } from "react";
import { ClipboardCheck, MessageCircle } from "lucide-react";

interface CheckIn {
  id: string;
  weekStartDate: string;
  weight: number | null;
  mood: number | null;
  energy: number | null;
  stress: number | null;
  sleepQuality: number | null;
  hunger: number | null;
  notes: string | null;
  coachFeedback: string | null;
  coachReadAt: string | null;
  createdAt: string;
}

export default function CheckInPage() {
  const [items, setItems] = useState<CheckIn[]>([]);
  const [form, setForm] = useState({
    weight: "",
    mood: 4,
    energy: 7,
    stress: 5,
    sleepQuality: 7,
    hunger: 5,
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    fetch("/api/check-ins")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/check-ins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Check-in enviado a Karla");
      setTimeout(() => setMessage(""), 2500);
      load();
    }
  };

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ClipboardCheck className="text-green-500" /> Check-in Semanal
        </h1>
        <p className="text-gray-500 mt-1">
          Comparte como te sentiste esta semana. Karla recibira tu reporte.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Peso actual (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <Slider
          label="Animo general"
          value={form.mood}
          max={5}
          onChange={(v) => setForm({ ...form, mood: v })}
          emoji={["😞", "😕", "😐", "🙂", "😄"]}
        />
        <Slider label="Energia" value={form.energy} max={10} onChange={(v) => setForm({ ...form, energy: v })} />
        <Slider label="Estres" value={form.stress} max={10} onChange={(v) => setForm({ ...form, stress: v })} />
        <Slider
          label="Calidad de sueno"
          value={form.sleepQuality}
          max={10}
          onChange={(v) => setForm({ ...form, sleepQuality: v })}
        />
        <Slider
          label="Hambre"
          value={form.hunger}
          max={10}
          onChange={(v) => setForm({ ...form, hunger: v })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Como te fue esta semana? (opcional)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            placeholder="Logros, dificultades, preguntas para Karla..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={submit}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-2.5 rounded-lg font-semibold"
          >
            {saving ? "Enviando..." : "Enviar check-in"}
          </button>
          {message && <span className="text-green-600 text-sm font-medium">{message}</span>}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Check-ins anteriores</h2>
        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-center text-gray-400 py-6">Aun no has enviado check-ins</p>
          )}
          {items.map((c) => (
            <div key={c.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-sm font-semibold text-gray-700">
                Semana del {new Date(c.weekStartDate).toLocaleDateString("es-MX")}
              </p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                {c.weight != null && <span>⚖️ {c.weight}kg</span>}
                {c.mood != null && <span>😊 {c.mood}/5</span>}
                {c.energy != null && <span>⚡ {c.energy}/10</span>}
                {c.stress != null && <span>🧠 {c.stress}/10</span>}
                {c.sleepQuality != null && <span>💤 {c.sleepQuality}/10</span>}
                {c.hunger != null && <span>🍽️ {c.hunger}/10</span>}
              </div>
              {c.notes && <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{c.notes}&rdquo;</p>}
              {c.coachFeedback && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                  <p className="text-xs font-semibold text-orange-600 flex items-center gap-1.5">
                    <MessageCircle size={12} /> Respuesta de Karla
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{c.coachFeedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  max,
  onChange,
  emoji,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
  emoji?: string[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-orange-600">
          {value}/{max}
          {emoji && ` ${emoji[value - 1]}`}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-orange-500"
      />
    </div>
  );
}
