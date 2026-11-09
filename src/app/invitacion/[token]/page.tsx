"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dumbbell,
  CheckCircle,
  AlertCircle,
  Lock,
  User,
  Mail,
  ArrowRight,
} from "lucide-react";

interface InviteData {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  hasClient: boolean;
  hasUser: boolean;
}

export default function AceptarInvitacion({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InviteData | null>(null);
  const [status, setStatus] = useState<"ok" | "expired" | "used" | "revoked" | "notfound" | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/invites/${token}`)
      .then(async (r) => {
        if (r.status === 404) setStatus("notfound");
        else if (r.status === 410) {
          const d = await r.json();
          if (d.error === "revocada") setStatus("revoked");
          else setStatus("expired");
        } else if (r.status === 409) setStatus("used");
        else if (r.ok) {
          const d = (await r.json()) as InviteData;
          setData(d);
          setFirstName(d.firstName ?? "");
          setLastName(d.lastName ?? "");
          setEmail(d.email ?? "");
          setStatus("ok");
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/invites/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "No se pudo activar");
        setSubmitting(false);
        return;
      }
      router.push("/miembro");
    } catch {
      setError("Error de red");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  if (status !== "ok") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="mx-auto text-amber-400" size={56} />
          <h1 className="text-2xl font-semibold tracking-tight">
            {status === "expired" && "Invitación expirada"}
            {status === "revoked" && "Invitación cancelada"}
            {status === "used" && "Invitación ya usada"}
            {status === "notfound" && "Invitación no válida"}
          </h1>
          <p className="text-white/60">
            Pídele a Karla que te envíe un nuevo link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header limpio */}
      <header className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="LM Sport Gym" width={36} height={36} className="h-9 w-9" />
          <div>
            <div className="text-sm font-semibold tracking-tight">LM Sport Gym</div>
            <div className="text-[10px] uppercase tracking-widest text-orange-400">By Karla Lizeth</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium mb-4">
              <CheckCircle size={12} />
              Invitación personalizada
            </div>
            <h1 className="text-3xl font-semibold tracking-tight leading-tight">
              Bienvenid{firstName.endsWith("a") ? "a" : "o"} a tu coaching
              {firstName ? `, ${firstName.split(" ")[0]}` : ""} 💪
            </h1>
            <p className="text-white/60 mt-3 text-sm leading-relaxed">
              Crea tu acceso para ver tu rutina, plan nutricional y registrar tu progreso desde el celular.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 space-y-4"
          >
            <Field icon={User} label="Nombre">
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-transparent outline-none text-base"
                placeholder="Tu nombre"
                autoComplete="given-name"
              />
            </Field>
            <Field icon={User} label="Apellido">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-transparent outline-none text-base"
                placeholder="Tu apellido"
                autoComplete="family-name"
              />
            </Field>
            <Field icon={Mail} label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none text-base"
                placeholder="tu@email.com"
                autoComplete="email"
                inputMode="email"
              />
            </Field>
            <Field icon={Lock} label="Contraseña (mínimo 6)">
              <input
                type={showPwd ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none text-base"
                placeholder="Elige una contraseña"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="text-xs text-white/40 hover:text-white/70 shrink-0"
              >
                {showPwd ? "Ocultar" : "Mostrar"}
              </button>
            </Field>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-500/90 disabled:opacity-50 text-white text-base font-semibold shadow-[0_6px_20px_-6px_rgba(249,115,22,0.6)] active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              {submitting ? "Activando…" : "Entrar a mi coaching"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-[11px] text-white/30 text-center mt-6">
            Al continuar aceptas ser contactad@ por Karla por WhatsApp o dentro de la app.
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1.5">
        {label}
      </span>
      <div className="flex items-center gap-2 h-12 px-3 rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/15 transition">
        <Icon size={16} className="text-white/40 shrink-0" />
        {children}
      </div>
    </label>
  );
}
