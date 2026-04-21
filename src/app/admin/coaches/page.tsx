"use client";

import { useEffect, useState, useCallback } from "react";
import { UserCog, Plus, Edit2, Trash2, X, Mail, Phone } from "lucide-react";

interface CoachUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  role: "coach",
};

export default function CoachesPage() {
  const [items, setItems] = useState<CoachUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/users?role=coach")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d.filter((u) => u.isActive) : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/users/${editingId}` : "/api/users";
    const method = editingId ? "PUT" : "POST";
    const body = editingId
      ? {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        }
      : form;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    } else {
      const d = await res.json().catch(() => ({ error: "Error" }));
      alert(d.error || "Error");
    }
  };

  const edit = (u: CoachUser) => {
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone ?? "",
      password: "",
      role: u.role,
    });
    setEditingId(u.id);
    setShowForm(true);
  };

  const remove = async (id: string) => {
    if (!confirm("Desactivar este coach? Ya no podra iniciar sesion.")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserCog className="text-indigo-500" /> Coaches
          </h1>
          <p className="text-gray-500 mt-1">{items.length} coach{items.length !== 1 ? "es" : ""} activos</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm"
        >
          <Plus size={20} /> Nuevo coach
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <UserCog size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-semibold">Sin coaches</p>
          <p className="text-sm text-gray-400 mt-1">
            Agrega entrenadores que podran crear rutinas y responder a miembros
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                    {u.firstName[0]}
                    {u.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{u.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => edit(u)}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                    title="Editar"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => remove(u.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    title="Desactivar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Mail size={12} className="text-gray-400 shrink-0" />
                  <span className="truncate">{u.email}</span>
                </p>
                {u.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={12} className="text-gray-400 shrink-0" />
                    {u.phone}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingId ? "Editar coach" : "Nuevo coach"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  disabled={!!editingId}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {editingId && "(deja vacio para mantener)"}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  minLength={editingId ? undefined : 6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="coach">Coach</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold"
              >
                {editingId ? "Guardar cambios" : "Crear coach"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
