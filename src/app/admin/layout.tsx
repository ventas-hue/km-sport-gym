import AppShell from "@/components/AppShell";
import AuthProvider from "@/components/AuthProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-theme min-h-screen bg-[#f3f4f6] text-[#1f2937]">
      <AuthProvider>
        <AppShell>{children}</AppShell>
      </AuthProvider>
    </div>
  );
}
