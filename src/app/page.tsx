"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CreditCard,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  CalendarCheck,
  XCircle,
  Phone,
} from "lucide-react";

interface DashboardData {
  totalClients: number;
  activeMemberships: number;
  expiringMemberships: number;
  expiredCount: number;
  monthlyIncome: number;
  membershipIncome: number;
  dayPassIncome: number;
  salesIncome: number;
  recentMemberships: Array<{
    id: string;
    startDate: string;
    endDate: string;
    client: { firstName: string; lastName: string };
    package: { name: string };
  }>;
  expiringSoon: Array<{
    id: string;
    endDate: string;
    client: { firstName: string; lastName: string; phone: string };
    package: { name: string };
  }>;
  expiredMemberships: Array<{
    id: string;
    endDate: string;
    client: { firstName: string; lastName: string; phone: string };
    package: { name: string };
  }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!data) return <p className="text-center text-gray-500">Error al cargar datos</p>;

  const stats = [
    {
      label: "Total Clientes",
      value: data.totalClients,
      icon: Users,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
    },
    {
      label: "Membresias Activas",
      value: data.activeMemberships,
      icon: CreditCard,
      color: "bg-green-500",
      lightColor: "bg-green-50",
    },
    {
      label: "Por Vencer (7 dias)",
      value: data.expiringMemberships,
      icon: AlertTriangle,
      color: "bg-yellow-500",
      lightColor: "bg-yellow-50",
    },
    {
      label: "Vencidas",
      value: data.expiredCount,
      icon: XCircle,
      color: "bg-red-500",
      lightColor: "bg-red-50",
    },
  ];

  const getDaysExpired = (endDate: string) => {
    const days = Math.floor((Date.now() - new Date(endDate).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="pt-8 lg:pt-0">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bienvenido a KM Sport Gym</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.lightColor} p-3 rounded-lg`}>
                <stat.icon className={`${stat.color.replace("bg-", "text-")}`} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Income Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-orange-500" size={20} />
            <h3 className="font-semibold text-gray-700">Total del Mes</h3>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            ${data.monthlyIncome.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-500" size={20} />
            <h3 className="font-semibold text-gray-700">Membresias</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            ${data.membershipIncome.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <CalendarCheck className="text-blue-500" size={20} />
            <h3 className="font-semibold text-gray-700">Visitas</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            ${data.dayPassIncome.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="text-purple-500" size={20} />
            <h3 className="font-semibold text-gray-700">Ventas</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            ${data.salesIncome.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Expired Memberships - PROMINENT */}
      {data.expiredMemberships.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-red-200">
          <div className="p-6 border-b border-red-100 bg-red-50 rounded-t-xl">
            <h2 className="text-lg font-bold flex items-center gap-2 text-red-700">
              <XCircle size={22} />
              Membresias Vencidas - Llamar para Renovar ({data.expiredMemberships.length})
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {data.expiredMemberships.map((m) => {
                const daysAgo = getDaysExpired(m.endDate);
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {m.client.firstName} {m.client.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{m.package.name}</p>
                      <p className="text-sm text-red-600 font-medium mt-1">
                        Vencida hace {daysAgo} dia{daysAgo !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <a
                        href={`tel:${m.client.phone}`}
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <Phone size={16} />
                        {m.client.phone}
                      </a>
                      <p className="text-xs text-gray-400 mt-2">
                        Vencio: {new Date(m.endDate).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expiring Soon */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" size={20} />
              Por Vencer (7 dias)
            </h2>
          </div>
          <div className="p-6">
            {data.expiringSoon.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                No hay membresias por vencer en los proximos 7 dias
              </p>
            ) : (
              <div className="space-y-3">
                {data.expiringSoon.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {m.client.firstName} {m.client.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{m.package.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-yellow-700">
                        Vence: {new Date(m.endDate).toLocaleDateString("es-MX")}
                      </p>
                      <a href={`tel:${m.client.phone}`} className="text-sm text-blue-500 hover:underline flex items-center justify-end gap-1 mt-1">
                        <Phone size={12} /> {m.client.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Memberships */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="text-green-500" size={20} />
              Membresias Recientes
            </h2>
          </div>
          <div className="p-6">
            {data.recentMemberships.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No hay membresias registradas</p>
            ) : (
              <div className="space-y-3">
                {data.recentMemberships.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {m.client.firstName} {m.client.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{m.package.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(m.startDate).toLocaleDateString("es-MX")}
                      </p>
                      <p className="text-xs text-gray-400">
                        Hasta: {new Date(m.endDate).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
