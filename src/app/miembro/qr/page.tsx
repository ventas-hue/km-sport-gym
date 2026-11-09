"use client";

import { useEffect, useState } from "react";
import { QrCode as QrIcon, Share2, Download } from "lucide-react";
import QRCode from "qrcode";

export default function MyQrPage() {
  const [token, setToken] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    fetch("/api/client-qr")
      .then((r) => r.json())
      .then(async (d) => {
        if (d.token) {
          setToken(d.token);
          const full = `${window.location.origin}/checkin/${d.token}`;
          setUrl(full);
          const dataUrl = await QRCode.toDataURL(full, {
            width: 512,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
          });
          setDataUrl(dataUrl);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const share = async () => {
    const msg = `Este es mi QR para entrar a LM Sport Gym 💪\n${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Mi QR LM Sport Gym", text: msg, url });
      } catch {}
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "lm-sport-gym-qr.png";
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-12 lg:pt-0 space-y-8 animate-fade-in max-w-md mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium mb-4">
          <QrIcon size={12} />
          Mi QR de acceso
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Tu pase al gym</h1>
        <p className="text-white/50 text-sm mt-2">
          Muéstralo en recepción al entrar o escanéalo tú mismo si hay lector disponible.
        </p>
      </div>

      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 text-center">
        {dataUrl ? (
          <div className="rounded-2xl bg-white p-4 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl} alt="Mi QR" className="w-full max-w-[280px] h-auto" />
          </div>
        ) : (
          <div className="py-12 text-white/50">No se pudo generar el QR</div>
        )}
        {token && (
          <div className="mt-4 text-xs text-white/40 font-mono tracking-widest">
            {token}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={download}
          className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-white/[0.06] border border-white/10 text-white font-medium hover:bg-white/[0.1] transition"
        >
          <Download size={16} />
          Guardar
        </button>
        <button
          onClick={share}
          className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-500/90 transition"
        >
          <Share2 size={16} />
          Compartir
        </button>
      </div>
    </div>
  );
}
