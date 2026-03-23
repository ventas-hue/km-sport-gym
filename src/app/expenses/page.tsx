"use client";

import { useEffect, useState } from "react";
import { Receipt, Plus, X } from "lucide-react";

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  paymentMethod: string;
  date: string;
  notes: string | null;
  createdAt: string;
}

const categories = [
  { value: "general", label: "General" },
  { value: "renta", label: "Renta" },
  { value: "servicios", label: "Servicios (luz, agua, internet)" },
  { value: "mantenimiento", label: "Mantenimiento / Reparaciones" },
  { value: "limpieza", label: "Limpieza" },
  { value: "nomina", label: "Nomina / Sueldos" },
  { value: "publicidad", label: "Publicidad" },
  { value: "equipo", label: "Equipo de Gimnasio" },
  { value: "otros", label: "Otros" },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: "",
    category: "general",
    amount: "",
    paymentMethod: "efectivo",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const fetchExpenses = () => {
    setLoading(true);
    fetch("/api/expenses")
      .then((r) => r.json())
      .then(setExpenses)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      alert("Error al registrar gasto");
      return;
    }
    setShowForm(false);
    setForm({ description: "", category: "general", amount: "", paymentMethod: "efectivo", date: new Date().toISOString().split("T")[0], notes: "" });
    fetchExpenses();
  };

  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = monthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryColors: Record<string, string> = {
    general: "bg-gray-100 text-gray-700",
    renta: "bg-purple-100 text-purple-700",
    servicios: "bg-yellow-100 text-yellow-700",
    mantenimiento: "bg-orange-100 text-orange-700",
    limpieza: "bg-cyan-100 text-cyan-700",
    nomina: "bg-blue-100 text-blue-700",
    publicidad: "bg-pink-100 text-pink-700",
    equipo: "bg-green-100 text-green-700",
    otros: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 lg:pt-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Receipt className="text-red-500" /> Gastos
          </h1>
          <p className="text-gray-500 mt-1">Control de gastos del gimnasio</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus size={20} /> Nuevo Gasto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Gastos del Mes</p>
          <p className="text-3xl font-bold text-red-600 mt-1">${monthTotal.toFixed(2)}</p>
        </div>
        {Object.entries(byCategory)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([cat, amount]) => (
            <div key={cat} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 capitalize">{categories.find((c) => c.value === cat)?.label || cat}</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">${amount.toFixed(2)}</p>
            </div>
          ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12 text-gray-400">
          <Receipt size={48} className="mx-auto mb-3 opacity-50" />
          <p>No hay gastos registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Descripcion</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Categoria</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Metodo</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Monto</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(e.date).toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{e.description}</p>
                      {e.notes && <p className="text-xs text-gray-400 mt-0.5">{e.notes}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${categoryColors[e.category] || "bg-gray-100 text-gray-700"}`}>
                        {categories.find((c) => c.value === e.category)?.label || e.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">{e.paymentMethod}</td>
                    <td className="px-6 py-4 text-right font-bold text-red-600">${e.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nuevo Gasto</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion *</label>
                <input
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  placeholder="Ej: Pago de luz del mes"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metodo de Pago</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  placeholder="Notas adicionales..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
                  Registrar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
