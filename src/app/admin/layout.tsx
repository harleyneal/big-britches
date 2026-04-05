"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ScrollText,
  Building2,
  Settings,
  LogOut,
  ChevronDown,
  Share2,
  CreditCard,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/auth/context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--sl-ice)] flex items-center justify-center">
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

  const isSuperAdmin = user.profile.role === "super_admin";

  // Build nav items — main navigation (no Settings or Dashboard here)
  const navItems = [
    { label: "Social", href: "/admin/social", icon: Share2 },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Logs", href: "/admin/content/logs", icon: ScrollText },
  ];

  if (isSuperAdmin) {
    navItems.push({ label: "Tenants", href: "/admin/tenants", icon: Building2 });
  }

  // White-label: show tenant logo if client user has one, otherwise Big Britches
  const tenantLogo = !isSuperAdmin && user.tenant?.logo_url;

  return (
    <div className="min-h-screen bg-[var(--sl-ice)]">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--sl-navy)] text-white z-50 flex items-center justify-between px-6 shadow-lg">
        {/* Left: Logo */}
        <Link href="/admin/content" className="flex items-center gap-3 shrink-0">
          {tenantLogo ? (
            <img
              src={tenantLogo}
              alt={user.tenant.name}
              className="h-8 w-auto max-w-[160px] object-contain"
            />
          ) : (
            <Image
              src="/logo-light.svg"
              alt="Big Britches"
              width={140}
              height={32}
              className="h-8 w-auto"
              priority
            />
          )}
        </Link>

        {/* Right: Nav icons + user menu */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--sl-blue)] text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                title={item.label}
              >
                <Icon size={18} className="shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-8 bg-white/20 mx-2" />

          {/* Dashboard icon — just left of user menu */}
          <Link
            href="/admin/content"
            className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors ${
              pathname === "/admin/content"
                ? "bg-[var(--sl-blue)] text-white"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            title="Dashboard"
          >
            <LayoutDashboard size={18} />
          </Link>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[var(--sl-blue)] flex items-center justify-center text-xs font-bold shrink-0">
                {(user.profile.display_name || user.email)?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:inline text-white/80 max-w-[120px] truncate">
                {user.profile.display_name || user.email}
              </span>
              <ChevronDown size={14} className="text-white/50 hidden lg:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl py-2 w-56 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-[var(--sl-navy)] truncate">
                    {user.profile.display_name || user.email}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[var(--sl-blue-10)] text-[var(--sl-blue)]">
                    {user.profile.role.replace("_", " ")}
                  </span>
                </div>
                <Link
                  href="/admin/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--sl-navy)] hover:bg-[var(--sl-ice)] transition-colors"
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
