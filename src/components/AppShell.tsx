"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type Role } from "./AuthProvider";
import LoginScreen from "./LoginScreen";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
  requireRole?: Role;
  redirectByRole?: Partial<Record<Role, string>>;
  sidebar?: React.ReactNode;
}

export default function AppShell({
  children,
  requireRole = "admin",
  redirectByRole,
  sidebar,
}: AppShellProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      user &&
      user.role !== requireRole &&
      user.role !== "admin"
    ) {
      const target =
        redirectByRole?.[user.role] ??
        (user.role === "coach" ? "/coach" : "/miembro");
      router.replace(target);
    }
  }, [isLoading, isAuthenticated, user, requireRole, redirectByRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (user && user.role !== requireRole && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Subtle ambient gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-orange-500/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-orange-500/[0.04] blur-[140px]" />
      </div>

      {sidebar ?? <Sidebar />}

      <main className="lg:ml-64 min-h-screen">
        <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10 max-w-[1400px] mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
