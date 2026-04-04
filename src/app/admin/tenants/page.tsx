"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import { Plus, Building2, Users, Globe, MoreVertical, Trash2, Edit, ExternalLink } from "lucide-react";
import type { Tenant } from "@/lib/auth/types";

export default function TenantsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTenant, setNewTenant] = useState<{ name: string; slug: string; custom_domain: string; plan: "startup" | "business"; primary_color: string }>({ name: "", slug: "", custom_domain: "", plan: "startup", primary_color: "#3B82F6" });
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Only super_admin can access this page
  useEffect(() => {
    if (user && user.profile.role !== "super_admin") {
      router.push("/admin/content");
    }
  }, [user, router]);

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    const res = await fetch("/api/tenants");
    if (res.ok) {
      const data = await res.json();
      setTenants(data);
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTenant),
    });

    if (res.ok) {
      setShowCreate(false);
      setNewTenant({ name: "", slug: "", custom_domain: "", plan: "startup", primary_color: "#3B82F6" });
      fetchTenants();
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this tenant? This will remove all associated data.")) return;

    const res = await fetch(`/api/tenants/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTenants(tenants.filter((t) => t.id !== id));
    }
  }

  function handleSlugify(name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setNewTenant({ ...newTenant, name, slug });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[var(--sl-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sl-navy)]">Tenants</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage white-label client organizations
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--sl-blue)] text-white rounded-lg font-medium hover:bg-[var(--sl-navy)] transition-colors"
        >
          <Plus size={18} />
          New Tenant
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--sl-blue-10)] rounded-lg">
              <Building2 size={20} className="text-[var(--sl-blue)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--sl-navy)]">{tenants.length}</p>
              <p className="text-sm text-gray-500">Total Tenants</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--sl-lime-20)] rounded-lg">
              <Users size={20} className="text-[var(--sl-navy)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--sl-navy)]">
                {tenants.filter((t) => t.active).length}
              </p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--sl-blue-10)] rounded-lg">
              <Globe size={20} className="text-[var(--sl-blue)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--sl-navy)]">
                {tenants.filter((t) => t.custom_domain).length}
              </p>
              <p className="text-sm text-gray-500">Custom Domains</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-lg font-semibold text-[var(--sl-navy)] mb-4">Create New Tenant</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1">Business Name</label>
                <input
                  type="text"
                  value={newTenant.name}
                  onChange={(e) => handleSlugify(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1">Slug (subdomain)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTenant.slug}
                    onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value })}
                    required
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent"
                    placeholder="acme-corp"
                  />
                  <span className="text-sm text-gray-400">.bigbritches.io</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1">Custom Domain (optional)</label>
                <input
                  type="text"
                  value={newTenant.custom_domain}
                  onChange={(e) => setNewTenant({ ...newTenant, custom_domain: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent"
                  placeholder="www.acmecorp.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1">Plan</label>
                  <select
                    value={newTenant.plan}
                    onChange={(e) => setNewTenant({ ...newTenant, plan: e.target.value as "startup" | "business" })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent"
                  >
                    <option value="startup">Startup ($37/mo)</option>
                    <option value="business">Business ($97/mo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1">Brand Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTenant.primary_color}
                      onChange={(e) => setNewTenant({ ...newTenant, primary_color: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newTenant.primary_color}
                      onChange={(e) => setNewTenant({ ...newTenant, primary_color: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[var(--sl-navy)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-[var(--sl-blue)] text-white rounded-lg font-medium text-sm hover:bg-[var(--sl-navy)] transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenant Grid */}
      {tenants.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-[var(--sl-navy)]">No tenants yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Create your first tenant to get started with the white-label platform.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-[var(--sl-blue)] text-white rounded-lg font-medium text-sm hover:bg-[var(--sl-navy)] transition-colors"
          >
            Create First Tenant
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5 hover:shadow-md transition-shadow relative"
            >
              {/* Menu */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setMenuOpen(menuOpen === tenant.id ? null : tenant.id)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
                {menuOpen === tenant.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40 z-10">
                    <button
                      onClick={() => {
                        setMenuOpen(null);
                        router.push(`/admin/tenants/${tenant.id}`);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--sl-navy)] hover:bg-gray-50"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    {tenant.custom_domain && (
                      <a
                        href={`https://${tenant.custom_domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--sl-navy)] hover:bg-gray-50"
                      >
                        <ExternalLink size={14} /> Visit Site
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setMenuOpen(null);
                        handleDelete(tenant.id);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Tenant info */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: tenant.primary_color }}
                >
                  {tenant.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[var(--sl-navy)] truncate">{tenant.name}</h3>
                  <p className="text-xs text-gray-400">{tenant.slug}.bigbritches.io</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                {tenant.custom_domain && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Globe size={14} />
                    <span className="truncate">{tenant.custom_domain}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      tenant.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tenant.active ? "Active" : "Inactive"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--sl-blue-10)] text-[var(--sl-blue)] capitalize">
                    {tenant.plan}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
