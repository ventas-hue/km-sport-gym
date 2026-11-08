"use client";

import { Printer, Share2, X } from "lucide-react";

export default function PrintControls({
  clientName,
  clientPhone,
  workoutName,
}: {
  clientName: string;
  clientPhone: string;
  workoutName: string;
}) {
  const share = () => {
    const url = window.location.href;
    const msg = encodeURIComponent(
      `Hola ${clientName}, aquí está tu plan de entrenamiento "${workoutName}" de LM Sport Gym 💪\n\n${url}\n\nAbre el link, dale a Guardar como PDF y sígueme con tus avances. — Karla`
    );
    const digits = clientPhone.replace(/\D/g, "");
    const withCountry = digits.length === 10 ? `52${digits}` : digits;
    const whatsapp = digits
      ? `https://wa.me/${withCountry}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    window.open(whatsapp, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="no-print sticky top-0 z-20 bg-neutral-900 text-white border-b border-white/10">
      <div className="mx-auto max-w-[800px] px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="text-white/50 text-xs">Vista imprimible</div>
          <div className="hidden sm:block text-white/30">·</div>
          <div className="hidden sm:block truncate max-w-[280px] text-white/80">
            {workoutName}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={share}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-500/90 text-white text-sm font-medium transition active:scale-[0.97]"
            title="Enviar por WhatsApp"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-orange-500 hover:bg-orange-500/90 text-white text-sm font-medium transition active:scale-[0.97]"
            title="Imprimir o guardar como PDF"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
          <button
            onClick={() => window.close()}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/70 transition"
            title="Cerrar"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
