"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Plus, Search, Edit2, Trash2, X, Eye } from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  emergencyContact: string | null;
  birthDate: string | null;
  notes: string | null;
  createdAt: string;
  memberships: Array<{
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    package: { name: string };
  }>;
}

interface ClientDetail extends Client {
  dayPasses: Array<{ id: string; date: string; amountPaid: number }>;
  sales: Array<{
    id: string;
    quantity: number;
    totalAmount: number;
    createdAt: string;
    product: { name: string };
  }>;
}

const emptyForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  emergencyContact: "",
  birthDate: "",
  notes: "",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [detail, setDetail] = useState<ClientDetail | null>(null);

  const fetchClients = useCallback(() => {
    setLoading(true);
    fetch(`/api/clients?search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then(setClients)
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/clients/${editingId}` : "/api/clients";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchClients();
  };

  const handleEdit = (client: Client) => {
    setForm({
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      email: client.email || "",
      emergencyContact: client.emergencyContact || "",
      birthDate: client.birthDate ? client.birthDate.split("T")[0] : "",
      notes: client.notes || "",
    });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Estas seguro de eliminar este cliente?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    fetchClients();
  };

  const viewDetail = async (id: string) => {
    const res = await fetch(`/api/clients/${id}`);
    setDetail(await res.json());
  };

  const getStatusBadge = (client: Client) => {
    const lastMembership = client.memberships?.[0];
    if (!lastMembership) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">Sin membresia</span>;
    const isActive = lastMembership.status === "active" && new Date(lastMembership.endDate) >= new Date();
    return (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {isActive ? "Activo" : "Vencido"}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 lg:pt-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="text-orange-500" /> Clientes
          </h1>
          <p className="text-gray-500 mt-1">{clients.length} clientes registrados</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus size={20} /> Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre o telefono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users size={48} className="mx-auto mb-3 opacity-50" />
            <p>No se encontraron clientes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nombre</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Telefono</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 hidden md:table-cell">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 hidden md:table-cell">Registro</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{client.firstName} {client.lastName}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{client.phone}</td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{client.email || "-"}</td>
                    <td className="px-6 py-4">{getStatusBadge(client)}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm hidden md:table-cell">
                      {new Date(client.createdAt).toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => viewDetail(client.id)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingId ? "Editar" : "Nuevo"} Cliente</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contacto de Emergencia</label>
                <input
                  value={form.emergencyContact}
                  onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  {editingId ? "Guardar Cambios" : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {detail.firstName} {detail.lastName}
              </h2>
              <button onClick={() => setDetail(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><span className="text-sm text-gray-500">Telefono:</span><p className="font-medium">{detail.phone}</p></div>
              <div><span className="text-sm text-gray-500">Email:</span><p className="font-medium">{detail.email || "-"}</p></div>
              <div><span className="text-sm text-gray-500">Emergencia:</span><p className="font-medium">{detail.emergencyContact || "-"}</p></div>
              <div><span className="text-sm text-gray-500">Nacimiento:</span><p className="font-medium">{detail.birthDate ? new Date(detail.birthDate).toLocaleDateString("es-MX") : "-"}</p></div>
            </div>
            {detail.notes && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Notas:</span>
                <p className="text-gray-700">{detail.notes}</p>
              </div>
            )}

            <h3 className="font-bold text-gray-800 mb-3">Historial de Membresias</h3>
            {detail.memberships.length === 0 ? (
              <p className="text-gray-400 mb-6">Sin membresias</p>
            ) : (
              <div className="space-y-2 mb-6">
                {detail.memberships.map((m) => (
                  <div key={m.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{m.package.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(m.startDate).toLocaleDateString("es-MX")} - {new Date(m.endDate).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      m.status === "active" && new Date(m.endDate) >= new Date() ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {m.status === "active" && new Date(m.endDate) >= new Date() ? "Activo" : "Vencido"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <h3 className="font-bold text-gray-800 mb-3">Compras Recientes</h3>
            {detail.sales.length === 0 ? (
              <p className="text-gray-400">Sin compras</p>
            ) : (
              <div className="space-y-2">
                {detail.sales.slice(0, 10).map((s) => (
                  <div key={s.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{s.product.name}</p>
                      <p className="text-sm text-gray-500">Cant: {s.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${s.totalAmount.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString("es-MX")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
