"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Plus, X } from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface DayPass {
  id: string;
  clientId: string | null;
  clientName: string | null;
  date: string;
  amountPaid: number;
  client: { firstName: string; lastName: string } | null;
}

export default function DayPassesPage() {
  const [dayPasses, setDayPasses] = useState<DayPass[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    clientName: "",
    amountPaid: "50",
    date: new Date().toISOString().split("T")[0],
    isRegistered: true,
  });

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/day-passes").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ])
      .then(([dp, c]) => {
        setDayPasses(dp);
        setClients(c);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/day-passes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: form.isRegistered ? form.clientId || null : null,
        clientName: !form.isRegistered ? form.clientName : null,
        amountPaid: form.amountPaid,
        date: form.date,
      }),
    });
    setShowForm(false);
    setForm({ clientId: "", clientName: "", amountPaid: "50", date: new Date().toISOString().split("T")[0], isRegistered: true });
    fetchAll();
  };

  const todayTotal = dayPasses
    .filter((dp) => new Date(dp.date).toDateString() === new Date().toDateString())
    .reduce((sum, dp) => sum + dp.amountPaid, 0);

  const todayCount = dayPasses.filter(
    (dp) => new Date(dp.date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 lg:pt-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarCheck className="text-orange-500" /> Visitas / Day Pass
          </h1>
          <p className="text-gray-500 mt-1">Registro de visitas por dia</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus size={20} /> Registrar Visita
        </button>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Visitas Hoy</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{todayCount}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Ingresos Hoy (Visitas)</p>
          <p className="text-3xl font-bold text-green-600 mt-1">${todayTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : dayPasses.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CalendarCheck size={48} className="mx-auto mb-3 opacity-50" />
            <p>No hay visitas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Visitante</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Monto</th>
                </tr>
              </thead>
              <tbody>
                {dayPasses.map((dp) => (
                  <tr key={dp.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {dp.client
                          ? `${dp.client.firstName} ${dp.client.lastName}`
                          : dp.clientName || "Visitante"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {dp.client ? "Cliente registrado" : "Visitante externo"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(dp.date).toLocaleDateString("es-MX", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">${dp.amountPaid.toFixed(2)}</td>
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
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Registrar Visita</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isRegistered: true })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.isRegistered ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Cliente Registrado
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isRegistered: false })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !form.isRegistered ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Visitante Externo
                </button>
              </div>
              {form.isRegistered ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <select
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="">Seleccionar (opcional)...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Visitante</label>
                  <input
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    placeholder="Nombre del visitante"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amountPaid}
                    onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
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
