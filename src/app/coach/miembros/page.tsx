"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Search } from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  createdAt: string;
  memberships: Array<{ id: string; status: string; endDate: string; package: { name: string } }>;
}

export default function CoachMembersPage() {
  const [items, setItems] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/clients?search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="text-blue-500" /> Miembros
        </h1>
        <p className="text-gray-500 mt-1">{items.length} miembros</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Users size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-semibold">Sin miembros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((c) => {
            const active =
              c.memberships?.[0] &&
              c.memberships[0].status === "active" &&
              new Date(c.memberships[0].endDate) >= new Date();
            return (
              <Link
                key={c.id}
                href={`/admin/clients?focus=${c.id}`}
                className={`bg-white rounded-xl p-4 border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${
                  active ? "border-gray-100" : "border-red-200 bg-red-50/30"
                }`}
              >
                <p className="font-bold text-gray-900">
                  {c.firstName} {c.lastName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{c.phone}</p>
                <div className="mt-2 flex items-center gap-2">
                  {c.memberships?.[0] ? (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                        active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {active ? "Activo" : "Vencido"}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500 font-medium">
                      Sin membresia
                    </span>
                  )}
                  {c.memberships?.[0] && (
                    <span className="text-xs text-gray-500">{c.memberships[0].package.name}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
