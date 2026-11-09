"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Droplet,
  Moon,
  Weight,
  Dumbbell,
  Apple,
  MessageCircle,
  ClipboardCheck,
  ChevronRight,
  Plus,
  Minus,
  Loader2,
  CreditCard,
} from "lucide-react";

interface Hoy {
  user: { firstName: string; lastName: string };
  membership: { packageName: string; daysLeft: number } | null;
  streak: number;
  today: {
    waterLiters: number;
    sleepHours: number | null;
    mood: number | null;
    sessionsCompleted: number;
    sessionsLogged: number;
  };
  week: { sessions: number };
  latestWeight: { value: number; date: string } | null;
  workoutToday: {
    workoutId: string;
    dayId: string;
    dayName: string;
    dayNumber: number;
    exerciseCount: number;
    exercises: Array<{ name: string; sets: number; reps: string; muscleGroup: string }>;
  } | null;
  nutrition: {
    name: string;
    caloriesTarget: number | null;
    mealsCount: number;
    meals: Array<{ name: string; timeOfDay: string | null; foodsCount: number }>;
  } | null;
  unreadMessages: number;
  pendingCheckin: boolean;
}

export default function HoyPage() {
  const [data, setData] = useState<Hoy | null>(null);
  const [loading, setLoading] = useState(true);
  const [weightInput, setWeightInput] = useState("");
  const [sleepInput, setSleepInput] = useState("");

  const load = useCallback(() => {
    fetch("/api/miembro/hoy")
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setData(d);
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const quickLog = async (kind: string, value?: number) => {
    await fetch("/api/quick-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, value }),
    });
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-orange-500" size={28} />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="pt-12 lg:pt-0 text-center py-20">
        <p className="text-white/50 mb-4">Aún no estás vinculad@ como miembro.</p>
        <Link
          href="/miembro/ficha"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-orange-500 text-white font-medium"
        >
          Llenar mi ficha
        </Link>
      </div>
    );
  }

  const name = data.user.firstName.split(" ")[0];
  const greeting = greet();
  const waterGoal = 2.5;
  const waterPct = Math.min(100, Math.round((data.today.waterLiters / waterGoal) * 100));

  return (
    <div className="pt-12 lg:pt-0 pb-24 lg:pb-0 space-y-5 animate-fade-in max-w-2xl mx-auto">
      {/* Saludo */}
      <div>
        <p className="text-sm text-white/50">{greeting}</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-0.5">
          Hola, {name} 👋
        </h1>
      </div>

      {/* Racha + stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <TopStat
          icon={Flame}
          value={data.streak}
          unit="días"
          label="Racha"
          tone="orange"
        />
        <TopStat
          icon={Dumbbell}
          value={data.week.sessions}
          unit="sem."
          label="Entrenos"
          tone="blue"
        />
        <TopStat
          icon={Weight}
          value={data.latestWeight?.value ?? "—"}
          unit="kg"
          label="Peso"
          tone="emerald"
        />
      </div>

      {/* Membresía */}
      {data.membership ? (
        <div className={`rounded-2xl border p-4 ${
          data.membership.daysLeft <= 3
            ? "border-amber-500/30 bg-amber-500/10"
            : "border-emerald-500/20 bg-emerald-500/5"
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-white/40">Membresía</div>
              <div className="font-semibold tracking-tight">{data.membership.packageName}</div>
              <div className="text-xs text-white/60 mt-0.5">
                {data.membership.daysLeft > 0
                  ? `${data.membership.daysLeft} día${data.membership.daysLeft !== 1 ? "s" : ""} restantes`
                  : "Vence hoy"}
              </div>
            </div>
            {data.membership.daysLeft <= 7 && (
              <Link
                href="/miembro/pagos"
                className="shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-lg bg-orange-500 hover:bg-orange-500/90 text-white text-xs font-medium"
              >
                <CreditCard size={13} /> Renovar
              </Link>
            )}
          </div>
        </div>
      ) : (
        <Link
          href="/miembro/pagos"
          className="block rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 text-orange-200 hover:bg-orange-500/15 transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Activa tu membresía</div>
              <div className="text-xs opacity-80 mt-0.5">Elige un plan y paga en línea</div>
            </div>
            <ChevronRight size={18} />
          </div>
        </Link>
      )}

      {/* Entreno de hoy */}
      {data.workoutToday ? (
        <Section title="Entreno de hoy" icon={Dumbbell}>
          <Link
            href={`/miembro/rutina`}
            className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-4 active:scale-[0.99] transition"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-orange-400">
                  Día {data.workoutToday.dayNumber}
                </div>
                <div className="font-semibold tracking-tight mt-0.5">
                  {data.workoutToday.dayName}
                </div>
                <div className="text-xs text-white/50 mt-1">
                  {data.workoutToday.exerciseCount} ejercicios
                </div>
              </div>
              <ChevronRight size={18} className="text-white/40 mt-1" />
            </div>
            <ul className="space-y-1.5">
              {data.workoutToday.exercises.map((e, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white/80 truncate">{e.name}</span>
                  <span className="text-white/50 text-xs shrink-0 ml-2">
                    {e.sets}×{e.reps}
                  </span>
                </li>
              ))}
              {data.workoutToday.exerciseCount > 4 && (
                <li className="text-xs text-white/40 text-center pt-1">
                  +{data.workoutToday.exerciseCount - 4} más
                </li>
              )}
            </ul>
          </Link>
        </Section>
      ) : (
        <Section title="Entreno de hoy" icon={Dumbbell}>
          <EmptyCard
            msg="Aún no tienes rutina asignada"
            cta="Ver mi rutina"
            href="/miembro/rutina"
          />
        </Section>
      )}

      {/* Comidas de hoy */}
      {data.nutrition && (
        <Section title={`${data.nutrition.name}`} icon={Apple}>
          <Link
            href="/miembro/nutricion"
            className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-4 active:scale-[0.99] transition"
          >
            {data.nutrition.caloriesTarget && (
              <div className="text-xs text-white/50 mb-3">
                Meta: {data.nutrition.caloriesTarget} kcal · {data.nutrition.mealsCount} comidas
              </div>
            )}
            <ul className="space-y-1.5">
              {data.nutrition.meals.map((m, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{m.name}</span>
                  <span className="text-white/50 text-xs">
                    {m.timeOfDay ?? `${m.foodsCount} alim.`}
                  </span>
                </li>
              ))}
            </ul>
          </Link>
        </Section>
      )}

      {/* Quick logs grid */}
      <Section title="Registro rápido">
        <div className="grid grid-cols-2 gap-3">
          {/* Agua */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Droplet size={16} className="text-blue-400" />
                <span className="text-xs font-medium uppercase tracking-wider text-white/60">Agua</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">
                {data.today.waterLiters.toFixed(1)}L
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden mb-3">
              <div
                className="h-full bg-blue-400 transition-all"
                style={{ width: `${waterPct}%` }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => quickLog("water_cup", 0.25)}
                className="flex-1 h-10 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium text-sm active:scale-[0.97] transition inline-flex items-center justify-center gap-1"
              >
                <Plus size={14} /> vaso
              </button>
              <button
                onClick={() => quickLog("water_set", Math.max(0, data.today.waterLiters - 0.25))}
                disabled={data.today.waterLiters <= 0}
                className="h-10 w-10 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/60 disabled:opacity-30 active:scale-[0.97] transition inline-flex items-center justify-center"
              >
                <Minus size={14} />
              </button>
            </div>
          </div>

          {/* Sueño */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Moon size={16} className="text-indigo-400" />
                <span className="text-xs font-medium uppercase tracking-wider text-white/60">Sueño</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">
                {data.today.sleepHours ? `${data.today.sleepHours}h` : "—"}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={sleepInput}
                onChange={(e) => setSleepInput(e.target.value)}
                placeholder={data.today.sleepHours?.toString() ?? "7.5"}
                className="flex-1 h-10 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                inputMode="decimal"
              />
              <button
                onClick={() => {
                  const v = parseFloat(sleepInput);
                  if (v > 0 && v <= 24) {
                    quickLog("sleep", v);
                    setSleepInput("");
                  }
                }}
                className="h-10 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-500/90 text-white font-medium text-sm active:scale-[0.97] transition"
              >
                OK
              </button>
            </div>
          </div>

          {/* Peso */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-4 col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Weight size={16} className="text-emerald-400" />
                <span className="text-xs font-medium uppercase tracking-wider text-white/60">Peso de hoy</span>
              </div>
              {data.latestWeight && (
                <span className="text-xs text-white/50">
                  Último: {data.latestWeight.value}kg
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder={data.latestWeight?.value.toString() ?? "70.0"}
                className="flex-1 h-11 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 text-base focus:outline-none focus:border-emerald-500/50"
                inputMode="decimal"
              />
              <button
                onClick={() => {
                  const v = parseFloat(weightInput);
                  if (v > 0) {
                    quickLog("weight", v);
                    setWeightInput("");
                  }
                }}
                className="h-11 px-5 rounded-lg bg-emerald-500 hover:bg-emerald-500/90 text-white font-medium active:scale-[0.97] transition"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Pendientes */}
      <Section title="Pendientes">
        <div className="space-y-2">
          {data.pendingCheckin && (
            <Link
              href="/miembro/check-in"
              className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200 active:scale-[0.99] transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <ClipboardCheck size={18} className="shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">Check-in semanal</div>
                  <div className="text-xs opacity-75">Cuéntale a tu coach cómo vas</div>
                </div>
              </div>
              <ChevronRight size={16} className="shrink-0" />
            </Link>
          )}
          {data.unreadMessages > 0 && (
            <Link
              href="/miembro/mensajes"
              className="flex items-center justify-between rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-blue-200 active:scale-[0.99] transition"
            >
              <div className="flex items-center gap-3">
                <MessageCircle size={18} />
                <div>
                  <div className="text-sm font-medium">
                    {data.unreadMessages} mensaje{data.unreadMessages !== 1 ? "s" : ""} sin leer
                  </div>
                  <div className="text-xs opacity-75">De tu coach</div>
                </div>
              </div>
              <ChevronRight size={16} />
            </Link>
          )}
          {!data.pendingCheckin && data.unreadMessages === 0 && (
            <div className="text-center text-sm text-white/40 py-6 rounded-2xl border border-white/[0.06]">
              ✓ Al día con tus pendientes
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function TopStat({
  icon: Icon,
  value,
  unit,
  label,
  tone,
}: {
  icon: React.ElementType;
  value: number | string;
  unit: string;
  label: string;
  tone: "orange" | "blue" | "emerald";
}) {
  const tones = {
    orange: "text-orange-400",
    blue: "text-blue-400",
    emerald: "text-emerald-400",
  } as const;
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-3 sm:p-4">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={13} className={tones[tone]} />
        <span className="text-[10px] uppercase tracking-wider text-white/50">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl sm:text-2xl font-semibold tracking-tight">{value}</span>
        <span className="text-[11px] text-white/40">{unit}</span>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
        {Icon && <Icon size={13} />}
        {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyCard({ msg, cta, href }: { msg: string; cta: string; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center active:scale-[0.99] transition"
    >
      <p className="text-sm text-white/50 mb-3">{msg}</p>
      <span className="inline-flex items-center gap-1 text-xs text-orange-300 font-medium">
        {cta} <ChevronRight size={12} />
      </span>
    </Link>
  );
}
