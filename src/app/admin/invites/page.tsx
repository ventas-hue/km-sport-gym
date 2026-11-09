"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Link as LinkIcon,
  Plus,
  Copy,
  CheckCircle,
  Trash2,
  MessageCircle,
  Clock,
  UserCheck,
  AlertCircle,
  X,
  Search,
} from "lucide-react";

interface Invite {
  id: string;
  token: string;
  clientId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
  client: { id: string; firstName: string; lastName: string; phone: string } | null;
}

interface ClientRow {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
}

export default function InvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/invites")
      .then((r) => r.json())
      .then(setInvites)
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const revoke = async (token: string) => {
    if (!confirm("¿Revocar esta invitación? El link dejará de funcionar.")) return;
    await fetch(`/api/invites/${token}`, { method: "DELETE" });
    load();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/invitacion/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const whatsappInvite = (inv: Invite) => {
    const name =
      inv.client?.firstName ??
      inv.firstName ??
      "miembro";
    const phone = (inv.client?.phone ?? inv.phone ?? "").replace(/\D/g, "");
    const withCC = phone.length === 10 ? `52${phone}` : phone;
    const url = `${window.location.origin}/invitacion/${inv.token}`;
    const msg = encodeURIComponent(
      `Hola ${name}! 👋\nTe doy acceso a tu coaching personalizado en LM Sport Gym. Abre este link desde tu celular para activar tu cuenta:\n\n${url}\n\nAhí vas a ver tu rutina, plan nutricional y registrar tu progreso.\n\n— Karla 💪`
    );
    const wa = phone ? `https://wa.me/${withCC}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(wa, "_blank", "noopener,noreferrer");
  };

  const statusOf = (inv: Invite) => {
    if (inv.revokedAt) return { label: "Revocada", tone: "red" } as const;
    if (inv.usedAt) return { label: "Activada", tone: "emerald" } as const;
    if (new Date(inv.expiresAt) < new Date()) return { label: "Expirada", tone: "amber" } as const;
    return { label: "Pendiente", tone: "blue" } as const;
  };

  const tones = {
    red: "bg-red-500/15 text-red-300 border-red-500/25",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    blue: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  } as const;

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Invitaciones</h1>
          <p className="text-white/50 text-sm mt-1">
            Genera un link único para cada cliente de coaching premium. Lo compartes
            por WhatsApp y entra sin registro largo.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-orange-500 text-white font-medium shadow-[0_6px_20px_-6px_rgba(249,115,22,0.6)] hover:bg-orange-500/90 active:scale-[0.97] transition"
        >
          <Plus size={18} />
          Nueva invitación
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-white/40">Cargando…</div>
      ) : invites.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] py-16 text-center">
          <LinkIcon className="mx-auto text-white/30 mb-3" size={32} />
          <p className="text-white/50 text-sm">
            Aún no tienes invitaciones. Crea la primera para enviarla a tu cliente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {invites.map((inv) => {
            const st = statusOf(inv);
            const name =
              inv.client
                ? `${inv.client.firstName} ${inv.client.lastName}`
                : [inv.firstName, inv.lastName].filter(Boolean).join(" ") ||
                  inv.email ||
                  inv.phone ||
                  "(sin nombre)";
            return (
              <div
                key={inv.id}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold tracking-tight">{name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${tones[st.tone]}`}
                      >
                        {st.tone === "emerald" ? <UserCheck size={10} /> :
                         st.tone === "amber" ? <Clock size={10} /> :
                         st.tone === "red" ? <AlertCircle size={10} /> :
                         <Clock size={10} />}
                        {st.label}
                      </span>
                    </div>
                    {(inv.email || inv.phone || inv.client?.phone) && (
                      <div className="text-xs text-white/50 mt-1 truncate">
                        {inv.email ?? ""} {inv.email && (inv.phone || inv.client?.phone) ? " · " : ""}
                        {inv.client?.phone ?? inv.phone ?? ""}
                      </div>
                    )}
                    <div className="text-[11px] text-white/40 mt-1">
                      Creada {new Date(inv.createdAt).toLocaleDateString("es-MX")} ·
                      {inv.usedAt ? (
                        <> activada {new Date(inv.usedAt).toLocaleDateString("es-MX")}</>
                      ) : (
                        <> expira {new Date(inv.expiresAt).toLocaleDateString("es-MX")}</>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {!inv.usedAt && !inv.revokedAt && (
                      <>
                        <button
                          onClick={() => copyLink(inv.token)}
                          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium transition flex-1 sm:flex-initial justify-center"
                        >
                          {copiedId === inv.token ? <CheckCircle size={13} /> : <Copy size={13} />}
                          {copiedId === inv.token ? "Copiado" : "Copiar link"}
                        </button>
                        <button
                          onClick={() => whatsappInvite(inv)}
                          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-500/90 text-white text-xs font-medium transition flex-1 sm:flex-initial justify-center"
                        >
                          <MessageCircle size={13} />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => revoke(inv.token)}
                          className="h-9 w-9 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-white/50 flex items-center justify-center transition"
                          title="Revocar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNew && <NewInviteModal onClose={() => setShowNew(false)} onCreated={() => { load(); setShowNew(false); }} />}
    </div>
  );
}

function NewInviteModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [days, setDays] = useState(14);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "existing") return;
    const t = setTimeout(() => {
      fetch(`/api/clients?search=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((rows) => setClients(rows.slice(0, 20)))
        .catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [mode, query]);

  const create = async () => {
    setSaving(true);
    setError(null);
    const body: Record<string, unknown> = { expiresInDays: days };
    if (mode === "existing") {
      if (!selectedId) {
        setError("Elige un cliente");
        setSaving(false);
        return;
      }
      body.clientId = selectedId;
    } else {
      if (!firstName || (!email && !phone)) {
        setError("Nombre y email/teléfono requeridos");
        setSaving(false);
        return;
      }
      body.firstName = firstName;
      body.lastName = lastName;
      body.email = email || undefined;
      body.phone = phone || undefined;
    }
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (!res.ok) {
      setError(d.error ?? "Error");
      setSaving(false);
      return;
    }
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-semibold tracking-tight">Nueva invitación</h2>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg hover:bg-white/5 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/10">
            {(["existing", "new"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 h-9 text-xs font-medium rounded-lg transition ${
                  mode === m ? "bg-white/10 text-white" : "text-white/50"
                }`}
              >
                {m === "existing" ? "Cliente existente" : "Nuevo cliente"}
              </button>
            ))}
          </div>

          {mode === "existing" ? (
            <>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre o teléfono…"
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div className="max-h-56 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/5">
                {clients.length === 0 ? (
                  <div className="py-6 text-center text-white/40 text-xs">
                    {query ? "Sin resultados" : "Empieza a escribir…"}
                  </div>
                ) : (
                  clients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full text-left px-3 py-2.5 flex items-center justify-between transition ${
                        selectedId === c.id ? "bg-orange-500/15" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {c.firstName} {c.lastName}
                        </div>
                        <div className="text-[11px] text-white/40">{c.phone}</div>
                      </div>
                      {selectedId === c.id && <CheckCircle size={14} className="text-orange-400" />}
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nombre" value={firstName} onChange={setFirstName} placeholder="María" />
                <Input label="Apellido" value={lastName} onChange={setLastName} placeholder="López" />
              </div>
              <Input label="Email" value={email} onChange={setEmail} placeholder="tu@email.com" type="email" />
              <Input label="Teléfono" value={phone} onChange={setPhone} placeholder="443 123 4567" type="tel" />
            </>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5">
              Expira en
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`h-10 rounded-lg border text-sm font-medium transition ${
                    days === d
                      ? "bg-orange-500/15 border-orange-500/40 text-orange-200"
                      : "bg-white/[0.04] border-white/10 text-white/60 hover:bg-white/[0.07]"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-2 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl text-white/70 hover:bg-white/5 text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={create}
            disabled={saving}
            className="h-10 px-5 rounded-xl bg-orange-500 text-white font-medium disabled:opacity-50 shadow-[0_6px_20px_-6px_rgba(249,115,22,0.6)]"
          >
            {saving ? "Creando…" : "Generar link"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label>
      <span className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
      />
    </label>
  );
}
