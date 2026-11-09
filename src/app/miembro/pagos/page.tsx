"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, CheckCircle } from "lucide-react";

interface Pkg {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
}

export default function PagosPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/packages").then((r) => r.json()),
      fetch("/api/client-qr").then((r) => r.json()).catch(() => null),
    ])
      .then(([pkgs, qr]) => {
        setPackages(pkgs);
        if (qr?.clientId) setClientId(qr.clientId);
      })
      .finally(() => setLoading(false));
  }, []);

  const pay = async (pkgId: string) => {
    if (!clientId) return;
    setPaying(pkgId);
    setError(null);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkgId, clientId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail ?? data.error ?? "No se pudo iniciar el pago");
        setPaying(null);
        return;
      }
      // Redirige al checkout de Mercado Pago
      const url = data.initPoint ?? data.sandboxInitPoint;
      if (url) window.location.href = url;
    } catch {
      setError("Error de red");
      setPaying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-orange-500" size={28} />
      </div>
    );
  }

  return (
    <div className="pt-12 lg:pt-0 space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium mb-4">
          <CreditCard size={12} />
          Pagar en línea
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Renueva tu membresía</h1>
        <p className="text-white/50 text-sm mt-2">
          Paga con tarjeta, OXXO o SPEI vía Mercado Pago. Se activa al instante.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {packages.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="font-semibold tracking-tight text-base">{p.name}</h3>
                {p.description && (
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">{p.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold tracking-tight">${p.price}</span>
              <span className="text-white/50 text-sm">MXN · {p.durationDays}d</span>
            </div>
            <button
              onClick={() => pay(p.id)}
              disabled={paying !== null}
              className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-500/90 disabled:opacity-50 text-white font-medium transition flex items-center justify-center gap-2"
            >
              {paying === p.id ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Preparando pago…
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Pagar ${p.price}
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

