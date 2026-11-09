"use client";

import { useState } from "react";
import { CheckCircle, LogIn } from "lucide-react";

export default function CheckinButton({
  token,
  clientName,
}: {
  token: string;
  clientName: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "duplicated" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken: token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo registrar");
        setState("error");
        return;
      }
      const data = await res.json();
      setState(data.duplicated ? "duplicated" : "success");
    } catch {
      setError("Error de red");
      setState("error");
    }
  };

  if (state === "success" || state === "duplicated") {
    return (
      <div className={`rounded-2xl p-5 text-center ${
        state === "success"
          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-200"
          : "bg-amber-500/15 border border-amber-500/30 text-amber-200"
      }`}>
        <CheckCircle className="mx-auto mb-2" size={32} />
        <div className="font-semibold">
          {state === "success" ? "¡Entrada registrada!" : "Ya había un check-in reciente"}
        </div>
        <div className="text-sm opacity-80 mt-1">{clientName}</div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={submit}
        disabled={state === "loading"}
        className="w-full h-12 rounded-xl bg-orange-500 text-white text-base font-semibold tracking-tight hover:bg-orange-500/90 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_6px_20px_-6px_rgba(249,115,22,0.6)]"
      >
        <LogIn size={18} />
        {state === "loading" ? "Registrando…" : "Registrar entrada"}
      </button>
      {error && <p className="text-sm text-red-400 text-center mt-3">{error}</p>}
    </>
  );
}
