"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { label: "Dashboard", href: "/admin/content" },
    { label: "Clients", href: "/admin/content/clients" },
    { label: "Logs", href: "/admin/content/logs" },
  ];

  return (
    <div className="min-h-screen bg-[var(--sl-ice)]">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[var(--sl-navy)] text-white transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--sl-blue-20)]">
          {sidebarOpen && (
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-wider">SNOW LEOPARD</h1>
              <p className="text-xs text-[var(--sl-blue)]">Labs Admin</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[var(--sl-blue-20)] rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-[var(--sl-blue-20)] transition-colors"
              title={item.label}
            >
              {sidebarOpen ? item.label : item.label.charAt(0)}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <main className="p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
