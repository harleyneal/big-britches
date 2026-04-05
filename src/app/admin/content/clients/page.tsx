"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Save, X, Settings2 } from "lucide-react";
import type { ContentClient } from "@/lib/content/types";

type EditingClient = ContentClient | null;

const BRAND_TONES = ["professional", "friendly", "technical", "casual", "authoritative"];

export default function ClientsPage() {
  const [clients, setClients] = useState<ContentClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingData, setEditingData] = useState<Partial<ContentClient>>({});

  const defaultFormData: Partial<ContentClient> = {
    business_name: "",
    industry: "",
    target_audience: "",
    brand_tone: "professional",
    website_url: "",
    platforms_enabled: {
      blog: true,
      facebook: true,
      instagram: true,
      google_business: true,
    },
    auto_approve: false,
    notification_email: "",
  };

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/content/clients");
        const data = await response.json();
        setClients(data.clients || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleAddClick = () => {
    setEditingData(defaultFormData);
    setShowAddForm(true);
  };

  const handleEditClick = (client: ContentClient) => {
    setEditingData({ ...client });
    setEditingId(client.id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setEditingData({});
  };

  const handleSave = async () => {
    if (!editingData.business_name || !editingData.notification_email) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const method = showAddForm ? "POST" : "PATCH";
      const url = showAddForm
        ? "/api/content/clients"
        : `/api/content/clients/${editingId}`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingData),
      });

      if (response.ok) {
        const data = await response.json();
        if (showAddForm) {
          setClients([...clients, data.client]);
        } else {
          setClients(
            clients.map((c) => (c.id === editingId ? data.client : c))
          );
        }
        handleCancel();
      }
    } catch (error) {
      console.error("Error saving client:", error);
      alert("Error saving client");
    }
  };

  const updatePlatformEnabled = (platform: keyof ContentClient['platforms_enabled'], value: boolean) => {
    setEditingData({
      ...editingData,
      platforms_enabled: {
        blog: editingData.platforms_enabled?.blog ?? true,
        facebook: editingData.platforms_enabled?.facebook ?? true,
        instagram: editingData.platforms_enabled?.instagram ?? true,
        google_business: editingData.platforms_enabled?.google_business ?? true,
        [platform]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-[var(--sl-navy)] opacity-60">
        Loading clients...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--sl-navy)]">
            Content Clients
          </h1>
          <p className="text-[var(--sl-navy)] opacity-60 mt-1">
            Manage client configurations and settings
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="px-6 py-2 bg-[var(--sl-blue)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-medium"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-[var(--sl-blue-10)] p-6">
          <h2 className="text-lg font-bold text-[var(--sl-navy)] mb-6">
            Add New Client
          </h2>
          <ClientForm
            data={editingData}
            onChange={setEditingData}
            onPlatformChange={updatePlatformEnabled}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clients.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[var(--sl-navy)] opacity-60">
            No clients configured yet
          </div>
        ) : (
          clients.map((client) =>
            editingId === client.id ? (
              <div
                key={client.id}
                className="bg-white rounded-lg border border-[var(--sl-blue-10)] p-6"
              >
                <h3 className="text-lg font-bold text-[var(--sl-navy)] mb-6">
                  Edit Client
                </h3>
                <ClientForm
                  data={editingData}
                  onChange={setEditingData}
                  onPlatformChange={updatePlatformEnabled}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </div>
            ) : (
              <div
                key={client.id}
                className="bg-white rounded-lg border border-[var(--sl-blue-10)] p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--sl-navy)]">
                      {client.business_name}
                    </h3>
                    <p className="text-sm text-[var(--sl-navy)] opacity-60">
                      {client.industry}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/content/clients/${client.id}`}
                      className="p-2 hover:bg-[var(--sl-blue-10)] rounded-lg transition-colors"
                      title="Configure payments & products"
                    >
                      <Settings2 size={18} className="text-[var(--sl-blue)]" />
                    </Link>
                    <button
                      onClick={() => handleEditClick(client)}
                      className="p-2 hover:bg-[var(--sl-blue-10)] rounded-lg transition-colors"
                      title="Edit client info"
                    >
                      <Edit2 size={18} className="text-[var(--sl-blue)]" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-[var(--sl-navy)] opacity-60">
                      Target Audience
                    </p>
                    <p className="text-[var(--sl-navy)]">
                      {client.target_audience}
                    </p>
                  </div>

                  <div>
                    <p className="text-[var(--sl-navy)] opacity-60">
                      Brand Tone
                    </p>
                    <p className="text-[var(--sl-navy)]">{client.brand_tone}</p>
                  </div>

                </div>

                <div className="pt-4 border-t border-[var(--sl-blue-10)]">
                  <p className="text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-2">
                    Platforms Enabled
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {client.platforms_enabled?.blog && (
                      <span className="px-2 py-1 bg-[var(--sl-blue-10)] text-[var(--sl-blue)] rounded text-xs font-medium">
                        Blog
                      </span>
                    )}
                    {client.platforms_enabled?.facebook && (
                      <span className="px-2 py-1 bg-[var(--sl-blue-10)] text-[var(--sl-blue)] rounded text-xs font-medium">
                        Facebook
                      </span>
                    )}
                    {client.platforms_enabled?.instagram && (
                      <span className="px-2 py-1 bg-[var(--sl-blue-10)] text-[var(--sl-blue)] rounded text-xs font-medium">
                        Instagram
                      </span>
                    )}
                    {client.platforms_enabled?.google_business && (
                      <span className="px-2 py-1 bg-[var(--sl-blue-10)] text-[var(--sl-blue)] rounded text-xs font-medium">
                        Google Business
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--sl-blue-10)]">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={client.auto_approve}
                      disabled
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-[var(--sl-navy)]">
                      Auto-approve enabled
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[var(--sl-navy)] opacity-60">
                  <p>Email: {client.notification_email}</p>
                  <p>Website: {client.website_url}</p>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}

function ClientForm({
  data,
  onChange,
  onPlatformChange,
  onSave,
  onCancel,
}: {
  data: Partial<ContentClient>;
  onChange: (data: Partial<ContentClient>) => void;
  onPlatformChange: (platform: keyof ContentClient['platforms_enabled'], value: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1">
            Business Name *
          </label>
          <input
            type="text"
            value={data.business_name || ""}
            onChange={(e) =>
              onChange({ ...data, business_name: e.target.value })
            }
            className="w-full px-3 py-2 border border-[var(--sl-blue-10)] rounded-lg text-sm"
            placeholder="Business name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1">
            Industry/Niche
          </label>
          <input
            type="text"
            value={data.industry || ""}
            onChange={(e) => onChange({ ...data, industry: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--sl-blue-10)] rounded-lg text-sm"
            placeholder="Industry"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1">
          Target Audience
        </label>
        <input
          type="text"
          value={data.target_audience || ""}
          onChange={(e) =>
            onChange({ ...data, target_audience: e.target.value })
          }
          className="w-full px-3 py-2 border border-[var(--sl-blue-10)] rounded-lg text-sm"
          placeholder="Target audience"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1">
            Brand Tone
          </label>
          <select
            value={data.brand_tone || "professional"}
            onChange={(e) =>
              onChange({ ...data, brand_tone: e.target.value })
            }
            className="w-full px-3 py-2 border border-[var(--sl-blue-10)] rounded-lg text-sm"
          >
            {BRAND_TONES.map((tone) => (
              <option key={tone} value={tone}>
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1">
            Website URL
          </label>
          <input
            type="url"
            value={data.website_url || ""}
            onChange={(e) =>
              onChange({ ...data, website_url: e.target.value })
            }
            className="w-full px-3 py-2 border border-[var(--sl-blue-10)] rounded-lg text-sm"
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1">
          Notification Email *
        </label>
        <input
          type="email"
          value={data.notification_email || ""}
          onChange={(e) =>
            onChange({ ...data, notification_email: e.target.value })
          }
          className="w-full px-3 py-2 border border-[var(--sl-blue-10)] rounded-lg text-sm"
          placeholder="email@example.com"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--sl-navy)] mb-3">
          Platforms Enabled
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.platforms_enabled?.blog || false}
              onChange={(e) =>
                onPlatformChange("blog", e.target.checked)
              }
              className="w-4 h-4"
            />
            <span className="text-sm text-[var(--sl-navy)]">Blog</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.platforms_enabled?.facebook || false}
              onChange={(e) =>
                onPlatformChange("facebook", e.target.checked)
              }
              className="w-4 h-4"
            />
            <span className="text-sm text-[var(--sl-navy)]">Facebook</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.platforms_enabled?.instagram || false}
              onChange={(e) =>
                onPlatformChange("instagram", e.target.checked)
              }
              className="w-4 h-4"
            />
            <span className="text-sm text-[var(--sl-navy)]">Instagram</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.platforms_enabled?.google_business || false}
              onChange={(e) =>
                onPlatformChange("google_business", e.target.checked)
              }
              className="w-4 h-4"
            />
            <span className="text-sm text-[var(--sl-navy)]">
              Google Business Profile
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.auto_approve || false}
            onChange={(e) =>
              onChange({ ...data, auto_approve: e.target.checked })
            }
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-[var(--sl-navy)]">
            Auto-approve posts
          </span>
        </label>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t border-[var(--sl-blue-10)]">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-[var(--sl-blue-10)] text-[var(--sl-navy)] rounded-lg hover:bg-[var(--sl-ice)] transition-colors font-medium flex items-center gap-2"
        >
          <X size={16} />
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-[var(--sl-blue)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
        >
          <Save size={16} />
          Save Client
        </button>
      </div>
    </div>
  );
}
