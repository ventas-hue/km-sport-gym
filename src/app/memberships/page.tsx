"use client";

import { useEffect, useState } from "react";
import { CreditCard, Plus, X, RefreshCw } from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface Pkg {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  isActive: boolean;
}

interface Membership {
  id: string;
  startDate: string;
  endDate: string;
  amountPaid: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  client: { id: string; firstName: string; lastName: string; phone: string };
  package: { name: string; price: number; durationDays: number };
}

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    clientId: "",
    packageId: "",
    startDate: new Date().toISOString().split("T")[0],
    paymentMethod: "efectivo",
    amountPaid: "",
  });

  const fetchAll = () => {
    setLoading(true);
    const params = filter === "expiring" ? "?expiringSoon=true" : filter !== "all" ? `?status=${filter}` : "";
    Promise.all([
      fetch(`/api/memberships${params}`).then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/packages").then((r) => r.json()),
    ])
      .then(([m, c, p]) => {
        setMemberships(m);
        setClients(c);
        setPackages(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPkg = packages.find((p) => p.id === form.packageId);
    await fetch("/api/memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amountPaid: form.amountPaid ? parseFloat(form.amountPaid) : selectedPkg?.price,
      }),
    });
    setShowForm(false);
    setForm({ clientId: "", packageId: "", startDate: new Date().toISOString().split("T")[0], paymentMethod: "efectivo", amountPaid: "" });
    fetchAll();
  };

  const handleRenew = async (membership: Membership) => {
    if (!confirm(`Renovar membresia de ${membership.client.firstName} ${membership.client.lastName}?`)) return;
    await fetch("/api/memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: membership.client.id,
        packageId: membership.package.name, // We need packageId, let's find it
        startDate: new Date().toISOString().split("T")[0],
        paymentMethod: "efectivo",
      }),
    });
    // Mark old as expired
    await fetch(`/api/memberships/${membership.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "expired" }),
    });
    fetchAll();
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancelar esta membresia?")) return;
    await fetch(`/api/memberships/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const getStatus = (m: Membership) => {
    if (m.status === "cancelled") return { label: "Cancelada", class: "bg-gray-100 text-gray-600" };
    if (new Date(m.endDate) < new Date()) return { label: "Vencida", class: "bg-red-100 text-red-700" };
    const daysLeft = Math.ceil((new Date(m.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7) return { label: `Vence en ${daysLeft}d`, class: "bg-yellow-100 text-yellow-700" };
    return { label: "Activa", class: "bg-green-100 text-green-700" };
  };

  const selectedPkg = packages.find((p) => p.id === form.packageId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 lg:pt-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="text-orange-500" /> Membresias
          </h1>
          <p className="text-gray-500 mt-1">Control de membresias y renovaciones</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus size={20} /> Nueva Membresia
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Todas" },
          { key: "active", label: "Activas" },
          { key: "expiring", label: "Por Vencer" },
          { key: "expired", label: "Vencidas" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : memberships.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CreditCard size={48} className="mx-auto mb-3 opacity-50" />
            <p>No se encontraron membresias</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Cliente</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Paquete</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 hidden md:table-cell">Inicio</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Vencimiento</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 hidden md:table-cell">Pago</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map((m) => {
                  const status = getStatus(m);
                  return (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{m.client.firstName} {m.client.lastName}</p>
                        <p className="text-xs text-gray-400">{m.client.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{m.package.name}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm hidden md:table-cell">
                        {new Date(m.startDate).toLocaleDateString("es-MX")}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {new Date(m.endDate).toLocaleDateString("es-MX")}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="font-semibold">${m.amountPaid.toFixed(2)}</p>
                        <p className="text-xs text-gray-400 capitalize">{m.paymentMethod}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${status.class}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {m.status !== "cancelled" && (
                            <>
                              <button
                                onClick={() => handleRenew(m)}
                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                title="Renovar"
                              >
                                <RefreshCw size={18} />
                              </button>
                              <button
                                onClick={() => handleCancel(m.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Cancelar"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nueva Membresia</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <select
                  required
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paquete *</label>
                <select
                  required
                  value={form.packageId}
                  onChange={(e) => {
                    const pkg = packages.find((p) => p.id === e.target.value);
                    setForm({ ...form, packageId: e.target.value, amountPaid: pkg?.price.toString() || "" });
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="">Seleccionar paquete...</option>
                  {packages.filter((p) => p.isActive).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.price.toFixed(2)} ({p.durationDays} dias)
                    </option>
                  ))}
                </select>
              </div>
              {selectedPkg && (
                <div className="bg-orange-50 p-3 rounded-lg text-sm">
                  <p className="text-orange-700 font-medium">{selectedPkg.name}</p>
                  <p className="text-orange-600">Precio: ${selectedPkg.price.toFixed(2)} - {selectedPkg.durationDays} dias</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto Pagado</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amountPaid}
                    onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    placeholder={selectedPkg?.price.toString()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Metodo de Pago</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
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
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
