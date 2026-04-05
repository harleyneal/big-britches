"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, FileText, Package, User, Plus, Trash2, GripVertical, CheckCircle, AlertCircle, Share2,
} from "lucide-react";

type FieldType = "text" | "number" | "currency" | "select" | "boolean" | "image" | "textarea";

interface ColumnDef {
  id: string;
  name: string;
  type: "text" | "number" | "currency";
  width: string;
}

interface AmountFormula {
  type: "manual" | "multiply" | "sum";
  columnIds: string[];
}

interface InvoiceTemplate {
  columns: ColumnDef[];
  amountFormula: AmountFormula;
  defaultTerms: string;
  defaultNotes: string;
  defaultTaxRate: number;
}

interface ProductField {
  id: string;
  name: string;
  key: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface ProductSchema {
  fields: ProductField[];
  enableInventory: boolean;
  enableVariants: boolean;
}

interface TenantData {
  id: string;
  name: string;
  industry?: string;
  target_audience?: string;
  brand_tone?: string;
  website_url?: string;
  notification_email?: string;
  auto_approve?: boolean;
  platforms_enabled?: Record<string, boolean>;
  payment_config?: {
    invoice_template?: InvoiceTemplate;
    product_schema?: ProductSchema;
  };
  plan?: string;
  slug?: string;
  custom_domain?: string;
  created_at?: string;
  updated_at?: string;
}

type ConfigTab = "invoicing" | "ecommerce" | "content" | "profile";

export default function TenantConfigPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [activeTab, setActiveTab] = useState<ConfigTab>("invoicing");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tenant, setTenant] = useState<TenantData | null>(null);

  const [invoiceTemplate, setInvoiceTemplate] = useState<InvoiceTemplate>({
    columns: [],
    amountFormula: { type: "manual", columnIds: [] },
    defaultTerms: "",
    defaultNotes: "",
    defaultTaxRate: 0,
  });

  const [productSchema, setProductSchema] = useState<ProductSchema>({
    fields: [],
    enableInventory: false,
    enableVariants: false,
  });

  const [contentData, setContentData] = useState({
    industry: "",
    target_audience: "",
    website_url: "",
    brand_tone: "",
    notification_email: "",
    auto_approve: false,
    platforms_enabled: {} as Record<string, boolean>,
  });

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/tenants/${tenantId}`);
        if (!res.ok) throw new Error("Failed to fetch tenant");
        const data: TenantData = await res.json();
        setTenant(data);

        if (data.payment_config?.invoice_template) {
          setInvoiceTemplate(data.payment_config.invoice_template);
        }
        if (data.payment_config?.product_schema) {
          setProductSchema(data.payment_config.product_schema);
        }
        setContentData({
          industry: data.industry || "",
          target_audience: data.target_audience || "",
          website_url: data.website_url || "",
          brand_tone: data.brand_tone || "",
          notification_email: data.notification_email || "",
          auto_approve: data.auto_approve || false,
          platforms_enabled: data.platforms_enabled || {},
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tenant");
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) fetchTenant();
  }, [tenantId]);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      let payload: Record<string, unknown> = {
        industry: contentData.industry,
        target_audience: contentData.target_audience,
        website_url: contentData.website_url,
        brand_tone: contentData.brand_tone,
        notification_email: contentData.notification_email,
        auto_approve: contentData.auto_approve,
        platforms_enabled: contentData.platforms_enabled,
      };

      if (activeTab === "invoicing" || activeTab === "ecommerce") {
        payload.payment_config = {
          invoice_template: invoiceTemplate,
          product_schema: productSchema,
        };
      }

      const res = await fetch(`/api/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save tenant");
      setSuccess("Saved!");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [tenantId, activeTab, invoiceTemplate, productSchema, contentData]);

  const addInvoiceColumn = () => {
    const newId = `col-${Date.now()}`;
    setInvoiceTemplate((prev) => ({
      ...prev,
      columns: [...prev.columns, { id: newId, name: "", type: "text", width: "1fr" }],
    }));
  };

  const updateInvoiceColumn = (id: string, field: keyof ColumnDef, value: unknown) => {
    setInvoiceTemplate((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => (col.id === id ? { ...col, [field]: value } : col)),
    }));
  };

  const deleteInvoiceColumn = (id: string) => {
    setInvoiceTemplate((prev) => ({
      ...prev,
      columns: prev.columns.filter((col) => col.id !== id),
      amountFormula: {
        ...prev.amountFormula,
        columnIds: prev.amountFormula.columnIds.filter((cid) => cid !== id),
      },
    }));
  };

  const addProductField = () => {
    const newId = `field-${Date.now()}`;
    setProductSchema((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        { id: newId, name: "", key: "", type: "text", required: false },
      ],
    }));
  };

  const updateProductField = (id: string, field: keyof ProductField, value: unknown) => {
    setProductSchema((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    }));
  };

  const deleteProductField = (id: string) => {
    setProductSchema((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
    }));
  };

  const toggleAmountFormulaColumn = (columnId: string) => {
    setInvoiceTemplate((prev) => ({
      ...prev,
      amountFormula: {
        ...prev.amountFormula,
        columnIds: prev.amountFormula.columnIds.includes(columnId)
          ? prev.amountFormula.columnIds.filter((id) => id !== columnId)
          : [...prev.amountFormula.columnIds, columnId],
      },
    }));
  };

  const togglePlatform = (platform: string) => {
    setContentData((prev) => ({
      ...prev,
      platforms_enabled: {
        ...prev.platforms_enabled,
        [platform]: !prev.platforms_enabled[platform],
      },
    }));
  };

  const toggleSwitch = (field: "auto_approve" | "enableInventory" | "enableVariants") => {
    if (field === "auto_approve") {
      setContentData((prev) => ({ ...prev, auto_approve: !prev.auto_approve }));
    } else if (field === "enableInventory") {
      setProductSchema((prev) => ({ ...prev, enableInventory: !prev.enableInventory }));
    } else if (field === "enableVariants") {
      setProductSchema((prev) => ({ ...prev, enableVariants: !prev.enableVariants }));
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-[var(--sl-navy)]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--sl-navy)]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--sl-navy)]">{tenant?.name || "Loading..."}</h1>
            <p className="text-sm text-[var(--sl-navy)] opacity-50">Tenant Configuration</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--sl-blue)] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {success ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save</span>
            </>
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("invoicing")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "invoicing"
              ? "bg-[var(--sl-blue)] text-white"
              : "bg-white border border-[var(--sl-blue-10)] text-[var(--sl-navy)] opacity-60 hover:opacity-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          Invoice Template
        </button>
        <button
          onClick={() => setActiveTab("ecommerce")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "ecommerce"
              ? "bg-[var(--sl-blue)] text-white"
              : "bg-white border border-[var(--sl-blue-10)] text-[var(--sl-navy)] opacity-60 hover:opacity-100"
          }`}
        >
          <Package className="w-4 h-4" />
          Product Fields
        </button>
        <button
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "content"
              ? "bg-[var(--sl-blue)] text-white"
              : "bg-white border border-[var(--sl-blue-10)] text-[var(--sl-navy)] opacity-60 hover:opacity-100"
          }`}
        >
          <Share2 className="w-4 h-4" />
          Content & Social
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "profile"
              ? "bg-[var(--sl-blue)] text-white"
              : "bg-white border border-[var(--sl-blue-10)] text-[var(--sl-navy)] opacity-60 hover:opacity-100"
          }`}
        >
          <User className="w-4 h-4" />
          Tenant Profile
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "invoicing" && (
        <div className="space-y-6">
          {/* Invoice Columns Card */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--sl-navy)]">Invoice Columns</h2>
                <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">Define the columns that appear on invoices</p>
              </div>
              <button
                onClick={addInvoiceColumn}
                className="flex items-center gap-1 text-xs font-medium text-[var(--sl-blue)] hover:underline"
              >
                <Plus className="w-3 h-3" />
                Add Column
              </button>
            </div>
            <div className="space-y-2">
              {invoiceTemplate.columns.map((column) => (
                <div
                  key={column.id}
                  className="bg-[var(--sl-ice)] rounded-lg px-3 py-2.5 flex items-center gap-3"
                >
                  <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                  <input
                    type="text"
                    placeholder="Column name"
                    value={column.name}
                    onChange={(e) => updateInvoiceColumn(column.id, "name", e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                  />
                  <select
                    value={column.type}
                    onChange={(e) => updateInvoiceColumn(column.id, "type", e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="currency">Currency</option>
                  </select>
                  <select
                    value={column.width}
                    onChange={(e) => updateInvoiceColumn(column.id, "width", e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                  >
                    <option value="2fr">Wide</option>
                    <option value="1.5fr">Medium</option>
                    <option value="1fr">Normal</option>
                    <option value="0.5fr">Narrow</option>
                  </select>
                  <button
                    onClick={() => deleteInvoiceColumn(column.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {invoiceTemplate.columns.length === 0 && (
                <p className="text-xs text-[var(--sl-navy)] opacity-40 py-2">No columns yet</p>
              )}
            </div>
          </div>

          {/* Amount Calculation Card */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <div>
              <h2 className="text-base font-semibold text-[var(--sl-navy)]">Amount Calculation</h2>
              <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">How to calculate line item amounts</p>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-2">Formula Type</label>
                <select
                  value={invoiceTemplate.amountFormula.type}
                  onChange={(e) =>
                    setInvoiceTemplate((prev) => ({
                      ...prev,
                      amountFormula: { ...prev.amountFormula, type: e.target.value as any },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)]"
                >
                  <option value="manual">Manual Entry</option>
                  <option value="multiply">Multiply Columns</option>
                  <option value="sum">Sum Columns</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-2">Columns to Include</label>
                <div className="flex flex-wrap gap-2">
                  {invoiceTemplate.columns.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => toggleAmountFormulaColumn(col.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        invoiceTemplate.amountFormula.columnIds.includes(col.id)
                          ? "bg-[var(--sl-blue)] text-white"
                          : "bg-[var(--sl-ice)] border border-[var(--sl-blue-10)] text-[var(--sl-navy)] opacity-60"
                      }`}
                    >
                      {col.name || "Unnamed"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Formula Preview</label>
                <div className="px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] bg-[var(--sl-ice)] text-xs text-[var(--sl-navy)] font-mono">
                  {invoiceTemplate.amountFormula.type === "manual"
                    ? "Amount = Manual entry"
                    : invoiceTemplate.amountFormula.columnIds.length === 0
                    ? "Select columns above"
                    : `Amount = ${invoiceTemplate.amountFormula.columnIds
                        .map((cid) => invoiceTemplate.columns.find((c) => c.id === cid)?.name || "?")
                        .join(invoiceTemplate.amountFormula.type === "multiply" ? " × " : " + ")}`}
                </div>
              </div>
            </div>
          </div>

          {/* Default Invoice Settings Card */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <div>
              <h2 className="text-base font-semibold text-[var(--sl-navy)]">Default Invoice Settings</h2>
              <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">Default values for new invoices</p>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Default Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={invoiceTemplate.defaultTaxRate}
                  onChange={(e) =>
                    setInvoiceTemplate((prev) => ({
                      ...prev,
                      defaultTaxRate: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Default Terms</label>
                <textarea
                  value={invoiceTemplate.defaultTerms}
                  onChange={(e) =>
                    setInvoiceTemplate((prev) => ({
                      ...prev,
                      defaultTerms: e.target.value,
                    }))
                  }
                  placeholder="e.g., Payment due within 30 days"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Default Notes</label>
                <textarea
                  value={invoiceTemplate.defaultNotes}
                  onChange={(e) =>
                    setInvoiceTemplate((prev) => ({
                      ...prev,
                      defaultNotes: e.target.value,
                    }))
                  }
                  placeholder="e.g., Thank you for your business"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Invoice Preview Card */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <div>
              <h2 className="text-base font-semibold text-[var(--sl-navy)]">Invoice Preview</h2>
              <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">Live preview of your invoice template</p>
            </div>
            <div className="mt-4 bg-[var(--sl-ice)] rounded-lg p-5">
              {/* Invoice header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-lg font-bold text-[var(--sl-navy)]">{tenant?.name || "Company Name"}</p>
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">123 Business Ave, Suite 100</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--sl-navy)]">INVOICE</p>
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">#INV-001</p>
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              {/* Client info row */}
              <div className="mb-4 pb-4 border-b border-[var(--sl-blue-10)]">
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Bill To</p>
                <p className="text-sm text-[var(--sl-navy)]">Sample Client</p>
                <p className="text-xs text-[var(--sl-navy)] opacity-40">client@example.com</p>
              </div>
              {/* Column headers */}
              {invoiceTemplate.columns.length > 0 ? (
                <div className="rounded-lg overflow-hidden border border-[var(--sl-blue-10)]">
                  <div
                    className="grid bg-[var(--sl-blue)] text-white"
                    style={{
                      gridTemplateColumns: [
                        ...invoiceTemplate.columns.map((c) => c.width || "1fr"),
                        "0.7fr",
                      ].join(" "),
                    }}
                  >
                    {invoiceTemplate.columns.map((col) => (
                      <div key={col.id} className="px-3 py-2 text-xs font-semibold">
                        {col.name || "Column"}
                      </div>
                    ))}
                    <div className="px-3 py-2 text-xs font-semibold text-right">Amount</div>
                  </div>
                  {/* Sample rows */}
                  {[1, 2].map((row) => (
                    <div
                      key={row}
                      className="grid bg-white border-t border-[var(--sl-blue-10)]"
                      style={{
                        gridTemplateColumns: [
                          ...invoiceTemplate.columns.map((c) => c.width || "1fr"),
                          "0.7fr",
                        ].join(" "),
                      }}
                    >
                      {invoiceTemplate.columns.map((col) => (
                        <div key={col.id} className="px-3 py-2.5 text-xs text-[var(--sl-navy)] opacity-40">
                          {col.type === "currency"
                            ? `$${(row * 50).toFixed(2)}`
                            : col.type === "number"
                            ? `${row}`
                            : `Sample ${col.name || "text"}`}
                        </div>
                      ))}
                      <div className="px-3 py-2.5 text-xs text-[var(--sl-navy)] font-medium text-right">
                        ${(row * 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">Add columns above to see the invoice preview</p>
                </div>
              )}
              {/* Invoice footer */}
              {invoiceTemplate.columns.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <div className="w-48 space-y-1.5">
                    <div className="flex justify-between text-xs text-[var(--sl-navy)]">
                      <span className="opacity-50">Subtotal</span>
                      <span>$300.00</span>
                    </div>
                    {invoiceTemplate.defaultTaxRate > 0 && (
                      <div className="flex justify-between text-xs text-[var(--sl-navy)]">
                        <span className="opacity-50">Tax ({invoiceTemplate.defaultTaxRate}%)</span>
                        <span>${(300 * invoiceTemplate.defaultTaxRate / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-semibold text-[var(--sl-navy)] pt-1.5 border-t border-[var(--sl-blue-10)]">
                      <span>Total</span>
                      <span>${(300 + 300 * invoiceTemplate.defaultTaxRate / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Terms */}
              {invoiceTemplate.defaultTerms && (
                <div className="mt-4 pt-3 border-t border-[var(--sl-blue-10)]">
                  <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Terms</p>
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">{invoiceTemplate.defaultTerms}</p>
                </div>
              )}
              {invoiceTemplate.defaultNotes && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Notes</p>
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">{invoiceTemplate.defaultNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "ecommerce" && (
        <div className="space-y-6">
          {/* Product Fields Card */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--sl-navy)]">Product Fields</h2>
                <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">Customize the product form for your clients</p>
              </div>
              <button
                onClick={addProductField}
                className="flex items-center gap-1 text-xs font-medium text-[var(--sl-blue)] hover:underline"
              >
                <Plus className="w-3 h-3" />
                Add Field
              </button>
            </div>
            <div className="space-y-2">
              {productSchema.fields.map((field) => (
                <div
                  key={field.id}
                  className="bg-[var(--sl-ice)] rounded-lg px-3 py-2.5 space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                    <input
                      type="text"
                      placeholder="Field name"
                      value={field.name}
                      onChange={(e) => updateProductField(field.id, "name", e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateProductField(field.id, "type", e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="currency">Currency</option>
                      <option value="select">Select</option>
                      <option value="textarea">Textarea</option>
                      <option value="boolean">Boolean</option>
                      <option value="image">Image</option>
                    </select>
                    <div className="flex items-center rounded-lg overflow-hidden border border-[var(--sl-blue-10)]">
                      <button
                        onClick={() => updateProductField(field.id, "required", true)}
                        className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          field.required
                            ? "bg-[var(--sl-blue)] text-white"
                            : "bg-white text-[var(--sl-navy)] opacity-40 hover:opacity-70"
                        }`}
                      >
                        REQ
                      </button>
                      <button
                        onClick={() => updateProductField(field.id, "required", false)}
                        className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          !field.required
                            ? "bg-[var(--sl-blue)] text-white"
                            : "bg-white text-[var(--sl-navy)] opacity-40 hover:opacity-70"
                        }`}
                      >
                        OPT
                      </button>
                    </div>
                    <button
                      onClick={() => deleteProductField(field.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 ml-7">
                    <input
                      type="text"
                      placeholder="Key (internal name)"
                      value={field.key}
                      onChange={(e) => updateProductField(field.id, "key", e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                    />
                  </div>
                  {field.type === "select" && (
                    <div className="flex items-center gap-3 ml-7">
                      <input
                        type="text"
                        placeholder="Options (comma-separated)"
                        value={field.options?.join(", ") || ""}
                        onChange={(e) =>
                          updateProductField(
                            field.id,
                            "options",
                            e.target.value.split(",").map((o) => o.trim())
                          )
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3 ml-7">
                    <input
                      type="text"
                      placeholder="Placeholder text"
                      value={field.placeholder || ""}
                      onChange={(e) => updateProductField(field.id, "placeholder", e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                    />
                  </div>
                </div>
              ))}
              {productSchema.fields.length === 0 && (
                <p className="text-xs text-[var(--sl-navy)] opacity-40 py-2">No fields yet</p>
              )}
            </div>
          </div>

          {/* Store Options Card */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <div>
              <h2 className="text-base font-semibold text-[var(--sl-navy)]">Store Options</h2>
              <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">E-commerce features for your tenant</p>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--sl-navy)]">Inventory Tracking</p>
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">Track product stock levels</p>
                </div>
                <button
                  onClick={() => toggleSwitch("enableInventory")}
                  className={`w-10 h-6 rounded-full transition-all flex items-center ${
                    productSchema.enableInventory
                      ? "bg-[var(--sl-blue)]"
                      : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      productSchema.enableInventory ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--sl-navy)]">Product Variants</p>
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">Allow product variants (size, color, etc.)</p>
                </div>
                <button
                  onClick={() => toggleSwitch("enableVariants")}
                  className={`w-10 h-6 rounded-full transition-all flex items-center ${
                    productSchema.enableVariants
                      ? "bg-[var(--sl-blue)]"
                      : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      productSchema.enableVariants ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Form Preview Card */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <div>
              <h2 className="text-base font-semibold text-[var(--sl-navy)]">Shopping Cart Preview</h2>
              <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">This is what your clients&apos; customers will see</p>
            </div>
            <div className="mt-4 bg-[var(--sl-ice)] rounded-lg p-5">
              {productSchema.fields.length > 0 ? (
                <div className="space-y-4">
                  {/* Image fields rendered as placeholders */}
                  {productSchema.fields.filter((f) => f.type === "image").length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-2">
                        {productSchema.fields.find((f) => f.type === "image")?.name || "Product Images"}
                        {productSchema.fields.find((f) => f.type === "image")?.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <div className="flex gap-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="w-24 h-24 rounded-lg border-2 border-dashed border-[var(--sl-blue-10)] bg-white flex flex-col items-center justify-center gap-1"
                          >
                            <Package className="w-6 h-6 text-[var(--sl-navy)] opacity-20" />
                            <span className="text-[10px] text-[var(--sl-navy)] opacity-30">
                              {i === 1 ? "Main" : `Photo ${i}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Non-image fields */}
                  {productSchema.fields
                    .filter((f) => f.type !== "image")
                    .map((field) => (
                      <div key={field.id}>
                        <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                          {field.name || "Unnamed Field"}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.type === "currency" ? (
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--sl-navy)] opacity-40">$</span>
                            <input
                              disabled
                              placeholder="0.00"
                              className="w-full pl-7 pr-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] opacity-50 bg-white"
                            />
                          </div>
                        ) : field.type === "boolean" ? (
                          <div className="flex items-center gap-3">
                            <button
                              disabled
                              className="w-10 h-6 rounded-full bg-gray-200 flex items-center"
                            >
                              <div className="w-5 h-5 rounded-full bg-white translate-x-0.5" />
                            </button>
                            <span className="text-xs text-[var(--sl-navy)] opacity-40">Off</span>
                          </div>
                        ) : field.type === "select" ? (
                          <div className="relative">
                            <select
                              disabled
                              className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] opacity-50 bg-white appearance-none"
                            >
                              <option>
                                {field.options && field.options.length > 0
                                  ? field.options[0]
                                  : field.placeholder || "Select option"}
                              </option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg className="w-4 h-4 text-[var(--sl-navy)] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        ) : field.type === "textarea" ? (
                          <textarea
                            disabled
                            placeholder={field.placeholder || "Enter text..."}
                            className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] opacity-50 resize-none bg-white"
                            rows={3}
                          />
                        ) : field.type === "number" ? (
                          <input
                            type="number"
                            disabled
                            placeholder={field.placeholder || "0"}
                            className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] opacity-50 bg-white"
                          />
                        ) : (
                          <input
                            disabled
                            placeholder={field.placeholder || "Enter text..."}
                            className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] opacity-50 bg-white"
                          />
                        )}
                      </div>
                    ))}

                  {/* Inventory field when enabled */}
                  {productSchema.enableInventory && (
                    <div className="pt-3 border-t border-[var(--sl-blue-10)]">
                      <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        disabled
                        placeholder="0"
                        className="w-32 px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] opacity-50 bg-white"
                      />
                      <p className="text-[10px] text-[var(--sl-navy)] opacity-30 mt-1">Inventory tracking enabled</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-8 h-8 text-[var(--sl-navy)] opacity-15 mx-auto mb-2" />
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">Add product fields above to see the form preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "content" && (
        <div className="space-y-6">
          {/* Business Details Card */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <div>
              <h2 className="text-base font-semibold text-[var(--sl-navy)]">Business Details</h2>
              <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">Information about the tenant business</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Industry</label>
                <input
                  type="text"
                  value={contentData.industry}
                  onChange={(e) => setContentData((prev) => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g., SaaS, E-commerce"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Target Audience</label>
                <input
                  type="text"
                  value={contentData.target_audience}
                  onChange={(e) => setContentData((prev) => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="e.g., Startups, Enterprises"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Website URL</label>
                <input
                  type="text"
                  value={contentData.website_url}
                  onChange={(e) => setContentData((prev) => ({ ...prev, website_url: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Brand Tone</label>
                <select
                  value={contentData.brand_tone}
                  onChange={(e) => setContentData((prev) => ({ ...prev, brand_tone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)]"
                >
                  <option value="">Select tone</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="playful">Playful</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Card */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <div>
              <h2 className="text-base font-semibold text-[var(--sl-navy)]">Notifications</h2>
              <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">Configure notification and approval settings</p>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Notification Email</label>
                <input
                  type="email"
                  value={contentData.notification_email}
                  onChange={(e) => setContentData((prev) => ({ ...prev, notification_email: e.target.value }))}
                  placeholder="notifications@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)]"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--sl-navy)]">Auto-Approve Invoices</p>
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">Automatically approve invoices without review</p>
                </div>
                <button
                  onClick={() => toggleSwitch("auto_approve")}
                  className={`w-10 h-6 rounded-full transition-all flex items-center ${
                    contentData.auto_approve
                      ? "bg-[var(--sl-blue)]"
                      : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      contentData.auto_approve ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Platforms Card */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <div>
              <h2 className="text-base font-semibold text-[var(--sl-navy)]">Enabled Platforms</h2>
              <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">Which platforms this tenant can use</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Shopify", "WooCommerce", "Square", "Stripe"].map((platform) => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    contentData.platforms_enabled[platform]
                      ? "bg-[var(--sl-blue)] text-white"
                      : "bg-[var(--sl-ice)] border border-[var(--sl-blue-10)] text-[var(--sl-navy)] opacity-60"
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-[var(--sl-navy)]">Tenant Information</h2>
              <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">Read-only tenant details</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Name</p>
                <p className="text-sm text-[var(--sl-navy)]">{tenant?.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Slug</p>
                <p className="text-sm text-[var(--sl-navy)]">{tenant?.slug || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Industry</p>
                <p className="text-sm text-[var(--sl-navy)]">{tenant?.industry || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Plan</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--sl-ice)] text-[var(--sl-navy)]">
                    {tenant?.plan || "—"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Email</p>
                <p className="text-sm text-[var(--sl-navy)]">{tenant?.notification_email || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Website</p>
                {tenant?.website_url ? (
                  <a
                    href={tenant.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--sl-blue)] hover:underline"
                  >
                    {tenant.website_url}
                  </a>
                ) : (
                  <p className="text-sm text-[var(--sl-navy)]">—</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Custom Domain</p>
                <p className="text-sm text-[var(--sl-navy)]">{tenant?.custom_domain || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Brand Tone</p>
                <p className="text-sm text-[var(--sl-navy)]">{tenant?.brand_tone || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Created</p>
                <p className="text-sm text-[var(--sl-navy)]">
                  {tenant?.created_at ? new Date(tenant.created_at).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Updated</p>
                <p className="text-sm text-[var(--sl-navy)]">
                  {tenant?.updated_at ? new Date(tenant.updated_at).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[var(--sl-blue-10)]">
              <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-2">Tenant ID</p>
              <p className="text-xs text-[var(--sl-navy)] font-mono bg-[var(--sl-ice)] px-3 py-2 rounded-lg break-all">
                {tenant?.id || "—"}
              </p>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-700">
                This information is read-only. Contact support to modify tenant details.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
