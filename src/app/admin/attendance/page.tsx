"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ScanLine, Users, Clock, CheckCircle, X, Camera } from "lucide-react";

interface Attendance {
  id: string;
  checkedAt: string;
  method: string;
  client: { id: string; firstName: string; lastName: string };
}

export default function AttendancePage() {
  const [rows, setRows] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/attendance")
      .then((r) => r.json())
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Asistencias</h1>
          <p className="text-white/50 text-sm mt-1">
            Check-in de miembros con QR en la entrada del gym.
          </p>
        </div>
        <button
          onClick={() => setScannerOpen(true)}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-orange-500 text-white font-medium shadow-[0_6px_20px_-6px_rgba(249,115,22,0.6)] hover:bg-orange-500/90 active:scale-[0.97] transition"
        >
          <ScanLine size={18} />
          Escanear QR
        </button>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Hoy" value={countToday(rows)} icon={Users} />
        <StatCard label="Esta semana" value={countThisWeek(rows)} icon={Users} />
        <StatCard label="Este mes" value={countThisMonth(rows)} icon={Users} />
        <StatCard label="Última hora" value={countLastHour(rows)} icon={Clock} />
      </div>

      {lastResult && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 px-4 py-3 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {lastResult}
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between text-xs uppercase tracking-wider text-white/40">
          <span>Últimas entradas</span>
          <span>{rows.length} registros</span>
        </div>
        {loading ? (
          <div className="py-20 text-center text-white/40 text-sm">Cargando…</div>
        ) : rows.length === 0 ? (
          <div className="py-20 text-center text-white/40 text-sm">Sin asistencias aún.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-white/40">
                <th className="text-left px-5 py-3 font-medium">Miembro</th>
                <th className="text-left px-5 py-3 font-medium">Fecha / Hora</th>
                <th className="text-left px-5 py-3 font-medium">Método</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-white/[0.04] hover:bg-white/[0.02] transition"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium">
                      {r.client.firstName} {r.client.lastName}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white/70">
                    {new Date(r.checkedAt).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      r.method === "qr"
                        ? "bg-orange-500/15 text-orange-300 border-orange-500/25"
                        : "bg-white/[0.06] text-white/70 border-white/10"
                    }`}>
                      {r.method === "qr" ? "QR" : "Manual"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {scannerOpen && (
        <QrScanner
          onClose={() => setScannerOpen(false)}
          onSuccess={(msg) => {
            setLastResult(msg);
            load();
            setTimeout(() => setLastResult(null), 6000);
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-2">
        <Icon size={13} />
        {label}
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function countToday(rows: Attendance[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return rows.filter((r) => new Date(r.checkedAt) >= today).length;
}
function countThisWeek(rows: Attendance[]) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return rows.filter((r) => new Date(r.checkedAt) >= d).length;
}
function countThisMonth(rows: Attendance[]) {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return rows.filter((r) => new Date(r.checkedAt) >= d).length;
}
function countLastHour(rows: Attendance[]) {
  const d = new Date(Date.now() - 60 * 60 * 1000);
  return rows.filter((r) => new Date(r.checkedAt) >= d).length;
}

/* ----- QR Scanner modal ----- */
function QrScanner({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    type QrInstance = {
      start: (
        cam: { facingMode: string },
        cfg: { fps: number; qrbox: number },
        onDecoded: (decoded: string) => void | Promise<void>,
        onErr: () => void
      ) => Promise<void>;
      stop: () => Promise<void>;
      clear: () => void;
    };
    let instance: QrInstance | null = null;

    (async () => {
      try {
        const mod = await import("html5-qrcode");
        if (!active || !divRef.current) return;
        const Html5Qrcode = mod.Html5Qrcode as unknown as new (id: string) => QrInstance;
        instance = new Html5Qrcode("qr-reader-box");
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 260 },
          async (decoded) => {
            // Extraer el token del URL /checkin/XYZ o aceptar el token directo
            const m = decoded.match(/\/checkin\/([A-Z0-9]+)/i);
            const token = m ? m[1] : decoded.trim().toUpperCase();
            try {
              const res = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrToken: token }),
              });
              const data = await res.json();
              if (!res.ok) {
                setError(data.error ?? "No se pudo registrar");
                return;
              }
              const name = data.attendance?.client
                ? `${data.attendance.client.firstName} ${data.attendance.client.lastName}`
                : "Miembro";
              onSuccess(
                data.duplicated
                  ? `${name}: ya tenía check-in reciente`
                  : `${name}: entrada registrada ✓`
              );
              instance?.stop().catch(() => {});
              onClose();
            } catch {
              setError("Error de red");
            }
          },
          () => {} // ignore scan errors
        );
      } catch (e) {
        setError((e as Error)?.message ?? "No se pudo iniciar la cámara");
      }
    })();

    return () => {
      active = false;
      instance?.stop().catch(() => {});
      instance?.clear();
    };
  }, [onClose, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-orange-400" />
            <span className="font-medium">Escanear QR del miembro</span>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg hover:bg-white/5 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4">
          <div id="qr-reader-box" ref={divRef} className="rounded-2xl overflow-hidden bg-black" />
          {error && (
            <p className="text-sm text-red-400 mt-3 text-center">{error}</p>
          )}
          <p className="text-xs text-white/40 mt-3 text-center">
            Apunta la cámara al QR del miembro. Se registra automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
