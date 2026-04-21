"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ArrowLeft, User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"email" | "admin">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const body =
      mode === "admin"
        ? { username: identifier, password }
        : { email: identifier, password };
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      const target =
        data.role === "admin"
          ? "/admin"
          : data.role === "coach"
          ? "/coach"
          : "/miembro";
      router.push(target);
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({ error: "Error" }));
    setError(data.error || "Credenciales incorrectas");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="LM Sport Gym"
              width={120}
              height={120}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">LM SPORT GYM</h1>
          <p className="text-orange-400 font-semibold mt-1 italic">
            &ldquo;Donde se hacen los campeones&rdquo;
          </p>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {mode === "admin" ? "Acceso Administrador" : "Iniciar Sesion"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {mode === "admin" ? "Usuario" : "Email"}
              </label>
              <div className="relative">
                {mode === "admin" ? (
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                ) : (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                )}
                <input
                  type={mode === "admin" ? "text" : "email"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  placeholder={mode === "admin" ? "admin" : "tu@email.com"}
                  required
                  autoComplete={mode === "admin" ? "username" : "email"}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  placeholder="Ingresa tu contraseña"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm text-center animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white py-3 rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/25"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Ingresando...
                </div>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === "email" ? (
              <>
                <p className="text-sm text-gray-400">
                  ¿No tienes cuenta?{" "}
                  <Link
                    href="/registro"
                    className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
                  >
                    Registrate
                  </Link>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode("admin");
                    setIdentifier("");
                    setPassword("");
                    setError("");
                  }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Acceso administrador
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode("email");
                  setIdentifier("");
                  setPassword("");
                  setError("");
                }}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Volver al login normal
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={14} />
            Volver al inicio
          </Link>
          <p className="text-gray-600 text-xs mt-3">
            LM Sport Gym &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
