"use client";

import { useEffect, useState } from "react";
import {
  MessageCircle,
  AlertTriangle,
  Clock,
  Flame,
  ClipboardList,
  RefreshCcw,
} from "lucide-react";

type Client = { id: string; firstName: string; lastName: string; phone: string };

type Expiring = {
  membershipId: string;
  daysToExpire: number;
  endDate: string;
  client: Client;
  package: { name: string; price: number };
};

type Expired = {
  membershipId: string;
  daysExpired: number;
  endDate: string;
  client: Client;
  package: { name: string; price: number };
};

type Inactive = { client: Client; lastAttendanceAt: string | null };

type PendingFeedback = {
  checkinId: string;
  createdAt: string;
  weight: number | null;
  mood: number | null;
  client: Client;
};

interface Data {
  expiringSoon: Expiring[];
  expired: Expired[];
  inactive: Inactive[];
  pendingFeedback: PendingFeedback[];
}

function waUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.length === 10 ? `52${digits}` : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export default function OutreachPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/outreach")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">A quién contactar hoy</h1>
          <p className="text-white/50 text-sm mt-1">
            Mensajes de WhatsApp pre-escritos para membresías por vencer, recuperación y seguimiento.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-white/10 bg-white/[0.04] text-white text-sm hover:bg-white/[0.07] transition"
        >
          <RefreshCcw size={14} />
          Actualizar
        </button>
      </div>

      {/* Membresías por vencer */}
      <Panel
        icon={Clock}
        tone="orange"
        title={`Por vencer (${data.expiringSoon.length})`}
        desc="Avísales antes para que renueven sin interrupción."
      >
        {data.expiringSoon.length === 0 ? (
          <Empty text="No hay membresías por vencer en los próximos 3 días." />
        ) : (
          data.expiringSoon.map((m) => {
            const msg = `Hola ${m.client.firstName}! 👋\nTu membresía "${m.package.name}" vence en ${m.daysToExpire} día${m.daysToExpire !== 1 ? "s" : ""} (${new Date(m.endDate).toLocaleDateString("es-MX")}).\n\n¿Renovamos para que no pierdas tu racha? 💪\n\n— Karla, LM Sport Gym`;
            return (
              <Row
                key={m.membershipId}
                name={`${m.client.firstName} ${m.client.lastName}`}
                meta={`${m.package.name} · vence en ${m.daysToExpire}d`}
                href={waUrl(m.client.phone, msg)}
                hasPhone={!!m.client.phone}
              />
            );
          })
        )}
      </Panel>

      {/* Vencidas recuperables */}
      <Panel
        icon={Flame}
        tone="red"
        title={`Vencidas recientes (${data.expired.length})`}
        desc="Recupera clientes que dejaron de renovar hace poco."
      >
        {data.expired.length === 0 ? (
          <Empty text="Ningún cliente vencido en los últimos 14 días." />
        ) : (
          data.expired.map((m) => {
            const msg = `Hola ${m.client.firstName} 👋\nNoté que tu membresía ${m.package.name} venció hace ${m.daysExpired} día${m.daysExpired !== 1 ? "s" : ""}. ¿Retomamos? Te tengo motivación 💪\n\n— Karla, LM Sport Gym`;
            return (
              <Row
                key={m.membershipId}
                name={`${m.client.firstName} ${m.client.lastName}`}
                meta={`${m.package.name} · vencida hace ${m.daysExpired}d`}
                href={waUrl(m.client.phone, msg)}
                hasPhone={!!m.client.phone}
              />
            );
          })
        )}
      </Panel>

      {/* Inactivos */}
      <Panel
        icon={AlertTriangle}
        tone="yellow"
        title={`Sin venir hace 7+ días (${data.inactive.length})`}
        desc="Miembros activos que no han entrado al gym."
      >
        {data.inactive.length === 0 ? (
          <Empty text="Todos tus miembros activos han entrado esta semana." />
        ) : (
          data.inactive.map((i) => {
            const last = i.lastAttendanceAt
              ? `último: ${new Date(i.lastAttendanceAt).toLocaleDateString("es-MX")}`
              : "sin asistencias aún";
            const msg = `Hola ${i.client.firstName}! 💪\nTe extrañamos en LM Sport Gym. ¿Nos vemos esta semana? Puedo ajustar tu rutina si algo no está funcionando.\n\n— Karla`;
            return (
              <Row
                key={i.client.id}
                name={`${i.client.firstName} ${i.client.lastName}`}
                meta={last}
                href={waUrl(i.client.phone, msg)}
                hasPhone={!!i.client.phone}
              />
            );
          })
        )}
      </Panel>

      {/* Check-ins sin feedback */}
      <Panel
        icon={ClipboardList}
        tone="blue"
        title={`Check-ins sin responder (${data.pendingFeedback.length})`}
        desc="Miembros que esperan tu retroalimentación semanal."
      >
        {data.pendingFeedback.length === 0 ? (
          <Empty text="Al día con los check-ins." />
        ) : (
          data.pendingFeedback.map((c) => {
            const msg = `Hola ${c.client.firstName}! Ya revisé tu check-in de esta semana. Te mando feedback 💪 — Karla`;
            return (
              <Row
                key={c.checkinId}
                name={`${c.client.firstName} ${c.client.lastName}`}
                meta={`check-in del ${new Date(c.createdAt).toLocaleDateString("es-MX")}${c.weight ? ` · ${c.weight}kg` : ""}`}
                href={waUrl(c.client.phone, msg)}
                hasPhone={!!c.client.phone}
              />
            );
          })
        )}
      </Panel>
    </div>
  );
}

function Panel({
  icon: Icon,
  tone,
  title,
  desc,
  children,
}: {
  icon: React.ElementType;
  tone: "orange" | "red" | "yellow" | "blue";
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  const tones = {
    orange: "bg-orange-500/15 text-orange-300 border-orange-500/25",
    red: "bg-red-500/15 text-red-300 border-red-500/25",
    yellow: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
    blue: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  } as const;
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-start gap-3">
        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${tones[tone]}`}>
          <Icon size={16} strokeWidth={1.8} />
        </div>
        <div>
          <div className="font-semibold tracking-tight text-[15px]">{title}</div>
          <div className="text-xs text-white/50 mt-0.5">{desc}</div>
        </div>
      </div>
      <div className="divide-y divide-white/[0.04]">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="px-5 py-8 text-center text-sm text-white/40">{text}</div>;
}

function Row({
  name,
  meta,
  href,
  hasPhone,
}: {
  name: string;
  meta: string;
  href: string;
  hasPhone: boolean;
}) {
  return (
    <div className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition">
      <div className="min-w-0">
        <div className="font-medium tracking-tight truncate">{name}</div>
        <div className="text-xs text-white/50 truncate">{meta}</div>
      </div>
      {hasPhone ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-500/90 text-white text-xs font-medium transition active:scale-[0.97]"
        >
          <MessageCircle size={13} />
          WhatsApp
        </a>
      ) : (
        <span className="shrink-0 text-xs text-white/30">sin tel.</span>
      )}
    </div>
  );
}
