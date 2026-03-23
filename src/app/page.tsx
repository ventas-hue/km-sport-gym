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
} from "lucide-react";

interface DashboardData {
  totalClients: number;
  activeMemberships: number;
  expiringMemberships: number;
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
      label: "Ingresos del Mes",
      value: `$${data.monthlyIncome.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
    },
  ];

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <h3 className="font-semibold text-gray-700">Ventas Productos</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            ${data.salesIncome.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expiring Soon */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" size={20} />
              Membresias por Vencer
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
                      <p className="text-xs text-gray-400">{m.client.phone}</p>
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
