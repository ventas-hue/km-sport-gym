"use client";

import { useEffect, useState, useCallback } from "react";
import { ClipboardCheck, Send, Check } from "lucide-react";

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
  client: { id: string; firstName: string; lastName: string };
}

export default function CoachCheckInsPage() {
  const [items, setItems] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "replied">("pending");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/check-ins/pending")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reply = async (id: string) => {
    const msg = feedback[id]?.trim();
    if (!msg) return;
    const res = await fetch(`/api/check-ins/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coachFeedback: msg }),
    });
    if (res.ok) {
      setFeedback({ ...feedback, [id]: "" });
      load();
    }
  };

  const filtered = items.filter((c) => {
    if (filter === "pending") return !c.coachFeedback;
    if (filter === "replied") return !!c.coachFeedback;
    return true;
  });

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ClipboardCheck className="text-green-500" /> Check-ins
        </h1>
        <p className="text-gray-500 mt-1">Revisa y responde los check-ins de tus miembros</p>
      </div>

      <div className="flex gap-2">
        {(["pending", "all", "replied"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f === "pending" ? "Pendientes" : f === "all" ? "Todos" : "Respondidos"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <ClipboardCheck size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-semibold">Sin check-ins</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">
                    {c.client.firstName} {c.client.lastName}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Semana del {new Date(c.weekStartDate).toLocaleDateString("es-MX")}
                  </p>
                </div>
                {c.coachFeedback && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                    <Check size={12} /> Respondido
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-600">
                {c.weight != null && (
                  <span className="bg-gray-100 px-2 py-0.5 rounded">⚖️ {c.weight}kg</span>
                )}
                {c.mood != null && (
                  <span className="bg-gray-100 px-2 py-0.5 rounded">😊 Animo {c.mood}/5</span>
                )}
                {c.energy != null && (
                  <span className="bg-gray-100 px-2 py-0.5 rounded">⚡ Energia {c.energy}/10</span>
                )}
                {c.stress != null && (
                  <span className="bg-gray-100 px-2 py-0.5 rounded">🧠 Estres {c.stress}/10</span>
                )}
                {c.sleepQuality != null && (
                  <span className="bg-gray-100 px-2 py-0.5 rounded">💤 Sueno {c.sleepQuality}/10</span>
                )}
                {c.hunger != null && (
                  <span className="bg-gray-100 px-2 py-0.5 rounded">🍽️ Hambre {c.hunger}/10</span>
                )}
              </div>

              {c.notes && (
                <p className="mt-3 text-sm text-gray-700 italic bg-gray-50 p-3 rounded-lg">
                  &ldquo;{c.notes}&rdquo;
                </p>
              )}

              {c.coachFeedback ? (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                  <p className="text-xs font-semibold text-orange-600">Tu respuesta</p>
                  <p className="text-sm text-gray-700 mt-1">{c.coachFeedback}</p>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <textarea
                    value={feedback[c.id] ?? ""}
                    onChange={(e) => setFeedback({ ...feedback, [c.id]: e.target.value })}
                    rows={2}
                    placeholder="Responde a tu miembro..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <button
                    onClick={() => reply(c.id)}
                    className="self-end bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center gap-1.5"
                  >
                    <Send size={14} /> Enviar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
