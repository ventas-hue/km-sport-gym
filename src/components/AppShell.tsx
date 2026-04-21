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
    if (!isLoading && isAuthenticated && user && user.role !== requireRole) {
      const target =
        redirectByRole?.[user.role] ??
        (user.role === "admin"
          ? "/admin"
          : user.role === "coach"
          ? "/coach"
          : "/miembro");
      router.replace(target);
    }
  }, [isLoading, isAuthenticated, user, requireRole, redirectByRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (user && user.role !== requireRole) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <>
      {sidebar ?? <Sidebar />}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </>
  );
}
