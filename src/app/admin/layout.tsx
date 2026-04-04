"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, Users, ScrollText, Building2, LogOut, ChevronDown } from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth/context";

function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/admin/content", icon: LayoutDashboard },
    { label: "Clients", href: "/admin/content/clients", icon: Users },
    { label: "Logs", href: "/admin/content/logs", icon: ScrollText },
  ];

  // Super admins get tenant management
  if (user?.profile.role === "super_admin") {
    navItems.push({ label: "Tenants", href: "/admin/tenants", icon: Building2 });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--sl-ice)] pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[var(--sl-blue)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--sl-ice)] pt-24">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-24 h-[calc(100vh-6rem)] bg-[var(--sl-navy)] text-white transition-all duration-300 z-40 flex flex-col ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--sl-blue-20)]">
          {sidebarOpen && (
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-wider">BIG BRITCHES</h1>
              <p className="text-xs text-[var(--sl-blue)]">
                {user.profile.role === "super_admin" ? "Super Admin" : user.tenant.name}
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[var(--sl-blue-20)] rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-1 px-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-[var(--sl-blue-20)] transition-colors"
                title={item.label}
              >
                <Icon size={20} className="shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section at bottom */}
        <div className="border-t border-[var(--sl-blue-20)] p-4">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.profile.display_name || user.email}
                </p>
                <p className="text-xs text-[var(--sl-blue)] truncate">{user.email}</p>
              </div>
              <button
                onClick={signOut}
                className="p-2 hover:bg-[var(--sl-blue-20)] rounded-lg transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={signOut}
              className="p-2 hover:bg-[var(--sl-blue-20)] rounded-lg transition-colors w-full flex justify-center"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <main className="p-8 max-w-7xl">{/* Children rendered by parent */}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthProvider>
      <AdminLayoutInner sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        {children}
      </AdminLayoutInner>
    </AuthProvider>
  );
}

function AdminLayoutInner({
  children,
  sidebarOpen,
  setSidebarOpen,
}: {
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/admin/content", icon: LayoutDashboard },
    { label: "Clients", href: "/admin/content/clients", icon: Users },
    { label: "Logs", href: "/admin/content/logs", icon: ScrollText },
  ];

  if (user?.profile.role === "super_admin") {
    navItems.push({ label: "Tenants", href: "/admin/tenants", icon: Building2 });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--sl-ice)] pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[var(--sl-blue)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--sl-ice)] pt-24">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-24 h-[calc(100vh-6rem)] bg-[var(--sl-navy)] text-white transition-all duration-300 z-40 flex flex-col ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--sl-blue-20)]">
          {sidebarOpen && (
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-wider">BIG BRITCHES</h1>
              <p className="text-xs text-[var(--sl-blue)]">
                {user.profile.role === "super_admin" ? "Super Admin" : user.tenant.name}
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[var(--sl-blue-20)] rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-6 space-y-1 px-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-[var(--sl-blue-20)] transition-colors"
                title={item.label}
              >
                <Icon size={20} className="shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--sl-blue-20)] p-4">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.profile.display_name || user.email}
                </p>
                <p className="text-xs text-[var(--sl-blue)] truncate">{user.email}</p>
              </div>
              <button
                onClick={signOut}
                className="p-2 hover:bg-[var(--sl-blue-20)] rounded-lg transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={signOut}
              className="p-2 hover:bg-[var(--sl-blue-20)] rounded-lg transition-colors w-full flex justify-center"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <main className="p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
