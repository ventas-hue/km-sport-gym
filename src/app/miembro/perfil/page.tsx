"use client";

import { useAuth } from "@/components/AuthProvider";
import { User, Mail, LogOut } from "lucide-react";

export default function PerfilPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <User className="text-indigo-500" /> Mi Perfil
        </h1>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center text-2xl font-bold">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 py-2">
            <Mail size={18} className="text-gray-400" />
            <span className="text-gray-700">{user.email}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <LogOut size={18} /> Cerrar sesion
        </button>
      </div>
    </div>
  );
}
