import AppShell from "@/components/AppShell";
import AuthProvider from "@/components/AuthProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-theme min-h-screen bg-black text-white">
      <AuthProvider>
        <AppShell>{children}</AppShell>
      </AuthProvider>
    </div>
  );
}
