"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { Palette, Mail, Save, Upload, X } from "lucide-react";

type Tab = "branding" | "contact";

interface BrandingForm {
  logo_url: string;
  primary_color: string;
  name: string;
}

interface ContactForm {
  contact_email: string;
  contact_phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip: string;
  website: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("branding");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Branding state
  const [branding, setBranding] = useState<BrandingForm>({
    logo_url: "",
    primary_color: "#3B82F6",
    name: "",
  });

  // Contact state
  const [contact, setContact] = useState<ContactForm>({
    contact_email: "",
    contact_phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip: "",
    website: "",
  });

  // Load tenant data
  useEffect(() => {
    if (user?.tenant) {
      setBranding({
        logo_url: user.tenant.logo_url || "",
        primary_color: user.tenant.primary_color || "#3B82F6",
        name: user.tenant.name || "",
      });

      const settings = user.tenant.settings as Record<string, string> | undefined;
      if (settings) {
        setContact({
          contact_email: settings.contact_email || user.email || "",
          contact_phone: settings.contact_phone || "",
          address_line1: settings.address_line1 || "",
          address_line2: settings.address_line2 || "",
          city: settings.city || "",
          state: settings.state || "",
          zip: settings.zip || "",
          website: settings.website || "",
        });
      } else {
        setContact((prev) => ({ ...prev, contact_email: user.email || "" }));
      }
    }
  }, [user]);

  async function handleSave() {
    if (!user?.tenant?.id) return;
    setSaving(true);
    setSaved(false);

    const payload: Record<string, unknown> = {};

    if (activeTab === "branding") {
      payload.name = branding.name;
      payload.primary_color = branding.primary_color;
      payload.logo_url = branding.logo_url;
    } else {
      payload.settings = {
        contact_email: contact.contact_email,
        contact_phone: contact.contact_phone,
        address_line1: contact.address_line1,
        address_line2: contact.address_line2,
        city: contact.city,
        state: contact.state,
        zip: contact.zip,
        website: contact.website,
      };
    }

    const res = await fetch(`/api/tenants/${user.tenant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  const tabs: { key: Tab; label: string; icon: typeof Palette }[] = [
    { key: "branding", label: "Company Branding", icon: Palette },
    { key: "contact", label: "Contact Information", icon: Mail },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--sl-navy)]">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your organization&apos;s branding and contact details
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-[var(--sl-blue-10)] p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--sl-blue)] text-white"
                  : "text-gray-500 hover:text-[var(--sl-navy)] hover:bg-gray-50"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6 md:p-8">
        {activeTab === "branding" && (
          <div className="space-y-6 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                value={branding.name}
                onChange={(e) => setBranding({ ...branding, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent transition-all"
                placeholder="Your Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={branding.primary_color}
                  onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                  className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.primary_color}
                  onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                  className="w-32 px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent transition-all text-sm font-mono"
                />
                <div
                  className="h-12 flex-1 rounded-lg border border-gray-200"
                  style={{ backgroundColor: branding.primary_color }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                Logo URL
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  value={branding.logo_url}
                  onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent transition-all"
                  placeholder="https://example.com/logo.svg"
                />
              </div>
              {branding.logo_url && (
                <div className="mt-3 p-4 bg-[var(--sl-ice)] rounded-lg border border-gray-200 flex items-center gap-4">
                  <img
                    src={branding.logo_url}
                    alt="Logo preview"
                    className="h-10 w-auto max-w-[200px] object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <button
                    onClick={() => setBranding({ ...branding, logo_url: "" })}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                This logo appears in the dashboard header when your team logs in.
                SVG or PNG recommended.
              </p>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-6 max-w-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={contact.contact_email}
                  onChange={(e) => setContact({ ...contact, contact_email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent transition-all"
                  placeholder="contact@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={contact.contact_phone}
                  onChange={(e) => setContact({ ...contact, contact_phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent transition-all"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                Website
              </label>
              <input
                type="url"
                value={contact.website}
                onChange={(e) => setContact({ ...contact, website: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent transition-all"
                placeholder="https://www.company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                Address Line 1
              </label>
              <input
                type="text"
                value={contact.address_line1}
                onChange={(e) => setContact({ ...contact, address_line1: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent transition-all"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                Address Line 2
              </label>
              <input
                type="text"
                value={contact.address_line2}
                onChange={(e) => setContact({ ...contact, address_line2: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent transition-all"
                placeholder="Suite 100"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={contact.city}
                  onChange={(e) => setContact({ ...contact, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent transition-all"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={contact.state}
                  onChange={(e) => setContact({ ...contact, state: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent transition-all"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sl-navy)] mb-1.5">
                  ZIP
                </label>
                <input
                  type="text"
                  value={contact.zip}
                  onChange={(e) => setContact({ ...contact, zip: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[var(--sl-ice)] text-[var(--sl-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--sl-blue)] focus:border-transparent transition-all"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--sl-blue)] text-white rounded-lg font-medium hover:bg-[var(--sl-navy)] transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">
              Changes saved successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
