"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  FileText,
  Package,
  Settings,
  Plus,
  Trash2,
  GripVertical,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

/* ─── Schema Types ─── */
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
  options?: string[]; // For select type
  placeholder?: string;
}

interface ProductSchema {
  fields: ProductField[];
  enableInventory: boolean;
  enableVariants: boolean;
}

type ConfigTab = "profile" | "invoicing" | "ecommerce";

/* ─── Helpers ─── */
const genId = () => Math.random().toString(36).slice(2, 10);

const defaultInvoiceTemplate = (): InvoiceTemplate => ({
  columns: [
    { id: "desc", name: "Description", type: "text", width: "1fr" },
    { id: "qty", name: "Qty", type: "number", width: "80px" },
    { id: "rate", name: "Rate", type: "currency", width: "110px" },
  ],
  amountFormula: { type: "multiply", columnIds: ["qty", "rate"] },
  defaultTerms: "Payment is due within 30 days of the invoice date.",
  defaultNotes: "",
  defaultTaxRate: 0,
});

const defaultProductSchema = (): ProductSchema => ({
  fields: [
    { id: "name", name: "Product Name", key: "name", type: "text", required: true, placeholder: "e.g. Premium Widget" },
    { id: "description", name: "Description", key: "description", type: "textarea", required: false, placeholder: "Describe the product..." },
    { id: "price", name: "Price", key: "price", type: "currency", required: true },
    { id: "category", name: "Category", key: "category", type: "text", required: false, placeholder: "e.g. Apparel" },
    { id: "sku", name: "SKU", key: "sku", type: "text", required: false, placeholder: "e.g. WDG-001" },
    { id: "image", name: "Product Image", key: "image_url", type: "image", required: false },
  ],
  enableInventory: true,
  enableVariants: false,
});

const fieldTypeLabels: Record<FieldType, string> = {
  text: "Text",
  number: "Number",
  currency: "Currency ($)",
  select: "Dropdown",
  boolean: "Toggle (Yes/No)",
  image: "Image URL",
  textarea: "Long Text",
};

/* ─── Component ─── */
export default function ClientConfigPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ConfigTab>("invoicing");

  // Config state
  const [invoiceTemplate, setInvoiceTemplate] = useState<InvoiceTemplate>(defaultInvoiceTemplate());
  const [productSchema, setProductSchema] = useState<ProductSchema>(defaultProductSchema());

  // Fetch client
  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/content/clients/${clientId}`);
      if (!res.ok) throw new Error("Client not found");
      const data = await res.json();
      setClient(data.client);

      // Load saved configs from client record
      const settings = (data.client.payment_config as Record<string, unknown>) || {};
      if (settings.invoice_template) {
        setInvoiceTemplate(settings.invoice_template as InvoiceTemplate);
      }
      if (settings.product_schema) {
        setProductSchema(settings.product_schema as ProductSchema);
      }
    } catch (err) {
      setError("Could not load client");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  // Save config
  const saveConfig = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch(`/api/content/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_config: {
            invoice_template: invoiceTemplate,
            product_schema: productSchema,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  /* ── Invoice column helpers ── */
  const addInvoiceColumn = () => {
    const newCol: ColumnDef = { id: genId(), name: "New Column", type: "number", width: "100px" };
    setInvoiceTemplate((t) => ({ ...t, columns: [...t.columns, newCol] }));
  };

  const updateInvoiceColumn = (colId: string, updates: Partial<ColumnDef>) => {
    setInvoiceTemplate((t) => ({
      ...t,
      columns: t.columns.map((c) => (c.id === colId ? { ...c, ...updates } : c)),
    }));
  };

  const removeInvoiceColumn = (colId: string) => {
    setInvoiceTemplate((t) => ({
      ...t,
      columns: t.columns.filter((c) => c.id !== colId),
      amountFormula: {
        ...t.amountFormula,
        columnIds: t.amountFormula.columnIds.filter((id) => id !== colId),
      },
    }));
  };

  const toggleFormulaColumn = (colId: string) => {
    setInvoiceTemplate((t) => {
      const current = t.amountFormula.columnIds;
      const updated = current.includes(colId)
        ? current.filter((id) => id !== colId)
        : [...current, colId];
      return { ...t, amountFormula: { ...t.amountFormula, columnIds: updated } };
    });
  };

  /* ── Product field helpers ── */
  const addProductField = () => {
    const newField: ProductField = {
      id: genId(),
      name: "New Field",
      key: `field_${genId()}`,
      type: "text",
      required: false,
      placeholder: "",
    };
    setProductSchema((s) => ({ ...s, fields: [...s.fields, newField] }));
  };

  const updateProductField = (fieldId: string, updates: Partial<ProductField>) => {
    setProductSchema((s) => ({
      ...s,
      fields: s.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
    }));
  };

  const removeProductField = (fieldId: string) => {
    setProductSchema((s) => ({ ...s, fields: s.fields.filter((f) => f.id !== fieldId) }));
  };

  /* ── Loading / Error ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[var(--sl-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={32} className="mx-auto text-red-400 mb-3" />
        <p className="text-sm text-[var(--sl-navy)] opacity-60">{error || "Client not found"}</p>
        <Link href="/admin/content/clients" className="text-sm text-[var(--sl-blue)] hover:underline mt-2 inline-block">
          Back to Clients
        </Link>
      </div>
    );
  }

  const clientName = String(client.business_name || "Unnamed Client");
  const numericInvoiceCols = invoiceTemplate.columns.filter((c) => c.type === "number" || c.type === "currency");

  const tabs: { key: ConfigTab; label: string; icon: React.ElementType }[] = [
    { key: "invoicing", label: "Invoice Template", icon: FileText },
    { key: "ecommerce", label: "Product Fields", icon: Package },
    { key: "profile", label: "Client Profile", icon: User },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/content/clients"
            className="p-2 rounded-lg hover:bg-[var(--sl-ice)] transition-colors"
          >
            <ArrowLeft size={20} className="text-[var(--sl-navy)] opacity-50" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--sl-navy)]">{clientName}</h1>
            <p className="text-sm text-[var(--sl-navy)] opacity-50">
              Client Configuration — Super Admin
            </p>
          </div>
        </div>
        <button
          onClick={saveConfig}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--sl-blue)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Configuration"}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-[var(--sl-blue)] text-white"
                  : "bg-white border border-[var(--sl-blue-10)] text-[var(--sl-navy)] opacity-60 hover:opacity-100"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Invoice Template Tab ── */}
      {activeTab === "invoicing" && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--sl-navy)]">Invoice Columns</h2>
                <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">
                  Define the line item columns this client sees when creating invoices
                </p>
              </div>
              <button
                onClick={addInvoiceColumn}
                className="flex items-center gap-1 text-xs font-medium text-[var(--sl-blue)] hover:underline"
              >
                <Plus size={14} />
                Add Column
              </button>
            </div>

            <div className="space-y-2">
              {invoiceTemplate.columns.map((col) => (
                <div key={col.id} className="flex items-center gap-2 bg-[var(--sl-ice)] rounded-lg px-3 py-2.5">
                  <GripVertical size={14} className="text-gray-300 shrink-0" />
                  <input
                    type="text"
                    value={col.name}
                    onChange={(e) => updateInvoiceColumn(col.id, { name: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                    placeholder="Column name"
                  />
                  <select
                    value={col.type}
                    onChange={(e) => updateInvoiceColumn(col.id, { type: e.target.value as ColumnDef["type"] })}
                    className="px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="currency">Currency ($)</option>
                  </select>
                  <select
                    value={col.width}
                    onChange={(e) => updateInvoiceColumn(col.id, { width: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white w-24"
                  >
                    <option value="1fr">Wide</option>
                    <option value="140px">Medium</option>
                    <option value="110px">Normal</option>
                    <option value="80px">Narrow</option>
                  </select>
                  <button
                    onClick={() => removeInvoiceColumn(col.id)}
                    disabled={invoiceTemplate.columns.length <= 1}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Amount Formula */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <h2 className="text-base font-semibold text-[var(--sl-navy)] mb-1">Amount Calculation</h2>
            <p className="text-xs text-[var(--sl-navy)] opacity-40 mb-4">
              How should the Amount column be calculated from the other columns?
            </p>

            <div className="flex items-center gap-3 mb-3">
              <select
                value={invoiceTemplate.amountFormula.type}
                onChange={(e) =>
                  setInvoiceTemplate((t) => ({
                    ...t,
                    amountFormula: { ...t.amountFormula, type: e.target.value as AmountFormula["type"] },
                  }))
                }
                className="px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
              >
                <option value="multiply">Multiply columns together</option>
                <option value="sum">Add columns together</option>
                <option value="manual">Manual entry (no formula)</option>
              </select>
            </div>

            {invoiceTemplate.amountFormula.type !== "manual" && (
              <>
                <p className="text-xs text-[var(--sl-navy)] opacity-50 mb-2">Select which columns to include:</p>
                <div className="flex flex-wrap gap-2">
                  {numericInvoiceCols.map((col) => {
                    const isSelected = invoiceTemplate.amountFormula.columnIds.includes(col.id);
                    return (
                      <button
                        key={col.id}
                        onClick={() => toggleFormulaColumn(col.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-[var(--sl-blue)] text-white"
                            : "bg-[var(--sl-ice)] border border-[var(--sl-blue-10)] text-[var(--sl-navy)] opacity-60"
                        }`}
                      >
                        {col.name}
                      </button>
                    );
                  })}
                  {numericInvoiceCols.length === 0 && (
                    <p className="text-xs text-[var(--sl-navy)] opacity-30">Add number or currency columns first</p>
                  )}
                </div>
                {invoiceTemplate.amountFormula.columnIds.length >= 2 && (
                  <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-3 bg-[var(--sl-ice)] px-3 py-2 rounded-lg inline-block">
                    Amount = {invoiceTemplate.amountFormula.columnIds
                      .map((id) => invoiceTemplate.columns.find((c) => c.id === id)?.name || "?")
                      .join(invoiceTemplate.amountFormula.type === "multiply" ? " × " : " + ")}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Default Terms */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <h2 className="text-base font-semibold text-[var(--sl-navy)] mb-1">Default Invoice Settings</h2>
            <p className="text-xs text-[var(--sl-navy)] opacity-40 mb-4">
              Pre-filled values when this client creates a new invoice
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Default Tax Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={invoiceTemplate.defaultTaxRate || ""}
                  onChange={(e) => setInvoiceTemplate((t) => ({ ...t, defaultTaxRate: Number(e.target.value) }))}
                  placeholder="0"
                  className="w-32 px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Default Payment Terms</label>
                <textarea
                  value={invoiceTemplate.defaultTerms}
                  onChange={(e) => setInvoiceTemplate((t) => ({ ...t, defaultTerms: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Default Notes</label>
                <textarea
                  value={invoiceTemplate.defaultNotes}
                  onChange={(e) => setInvoiceTemplate((t) => ({ ...t, defaultNotes: e.target.value }))}
                  rows={2}
                  placeholder="e.g. Thank you for your business!"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Product Schema Tab ── */}
      {activeTab === "ecommerce" && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--sl-navy)]">Product Fields</h2>
                <p className="text-xs text-[var(--sl-navy)] opacity-40 mt-0.5">
                  Define the fields this client sees when adding products to their store
                </p>
              </div>
              <button
                onClick={addProductField}
                className="flex items-center gap-1 text-xs font-medium text-[var(--sl-blue)] hover:underline"
              >
                <Plus size={14} />
                Add Field
              </button>
            </div>

            <div className="space-y-2">
              {productSchema.fields.map((field) => (
                <div key={field.id} className="bg-[var(--sl-ice)] rounded-lg px-3 py-3">
                  <div className="flex items-center gap-2">
                    <GripVertical size={14} className="text-gray-300 shrink-0" />

                    {/* Field name */}
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateProductField(field.id, { name: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                      placeholder="Field label"
                    />

                    {/* Field key */}
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => updateProductField(field.id, { key: e.target.value.replace(/\s/g, "_").toLowerCase() })}
                      className="w-28 px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-xs text-[var(--sl-navy)] opacity-60 focus:outline-none focus:border-[var(--sl-blue)] bg-white font-mono"
                      placeholder="field_key"
                    />

                    {/* Type */}
                    <select
                      value={field.type}
                      onChange={(e) => updateProductField(field.id, { type: e.target.value as FieldType })}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                    >
                      {Object.entries(fieldTypeLabels).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>

                    {/* Required toggle */}
                    <button
                      onClick={() => updateProductField(field.id, { required: !field.required })}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                        field.required
                          ? "bg-[var(--sl-blue)] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                      title={field.required ? "Required" : "Optional"}
                    >
                      {field.required ? "REQ" : "OPT"}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => removeProductField(field.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Dropdown options (for select type) */}
                  {field.type === "select" && (
                    <div className="mt-2 ml-6">
                      <label className="block text-[10px] font-medium text-[var(--sl-navy)] opacity-50 mb-1">
                        Dropdown Options (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={(field.options || []).join(", ")}
                        onChange={(e) =>
                          updateProductField(field.id, {
                            options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean),
                          })
                        }
                        placeholder="Small, Medium, Large"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-xs text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                      />
                    </div>
                  )}

                  {/* Placeholder (for text/textarea) */}
                  {(field.type === "text" || field.type === "textarea") && (
                    <div className="mt-2 ml-6">
                      <input
                        type="text"
                        value={field.placeholder || ""}
                        onChange={(e) => updateProductField(field.id, { placeholder: e.target.value })}
                        placeholder="Placeholder text (optional)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--sl-blue-10)] text-[10px] text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                      />
                    </div>
                  )}
                </div>
              ))}

              {productSchema.fields.length === 0 && (
                <div className="text-center py-8">
                  <Package size={28} className="mx-auto text-[var(--sl-navy)] opacity-15 mb-2" />
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">No fields defined yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <h2 className="text-base font-semibold text-[var(--sl-navy)] mb-4">Store Options</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm text-[var(--sl-navy)]">Inventory Tracking</p>
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">Show stock quantity field on products</p>
                </div>
                <button
                  onClick={() => setProductSchema((s) => ({ ...s, enableInventory: !s.enableInventory }))}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    productSchema.enableInventory ? "bg-[var(--sl-blue)]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      productSchema.enableInventory ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm text-[var(--sl-navy)]">Product Variants</p>
                  <p className="text-xs text-[var(--sl-navy)] opacity-40">Allow size, color, or other variant options</p>
                </div>
                <button
                  onClick={() => setProductSchema((s) => ({ ...s, enableVariants: !s.enableVariants }))}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    productSchema.enableVariants ? "bg-[var(--sl-blue)]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      productSchema.enableVariants ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
            <h2 className="text-base font-semibold text-[var(--sl-navy)] mb-1">Form Preview</h2>
            <p className="text-xs text-[var(--sl-navy)] opacity-40 mb-4">
              This is what the client will see when adding a product
            </p>

            <div className="bg-[var(--sl-ice)] rounded-lg p-5 space-y-4 max-w-lg">
              {productSchema.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                    {field.name}
                    {field.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <div className="w-full h-16 rounded-lg border border-[var(--sl-blue-10)] bg-white px-3 py-2 text-xs text-gray-300">
                      {field.placeholder || field.name}
                    </div>
                  ) : field.type === "select" ? (
                    <div className="w-full rounded-lg border border-[var(--sl-blue-10)] bg-white px-3 py-2 text-xs text-gray-300">
                      {(field.options || [])[0] || "Select..."}
                    </div>
                  ) : field.type === "boolean" ? (
                    <div className="w-10 h-5 rounded-full bg-gray-200 relative">
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow" />
                    </div>
                  ) : field.type === "image" ? (
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-[var(--sl-blue-10)] bg-white flex items-center justify-center">
                      <Package size={20} className="text-gray-200" />
                    </div>
                  ) : field.type === "currency" ? (
                    <div className="w-full rounded-lg border border-[var(--sl-blue-10)] bg-white px-3 py-2 text-xs text-gray-300">
                      $ 0.00
                    </div>
                  ) : (
                    <div className="w-full rounded-lg border border-[var(--sl-blue-10)] bg-white px-3 py-2 text-xs text-gray-300">
                      {field.placeholder || field.name}
                    </div>
                  )}
                </div>
              ))}

              {productSchema.enableInventory && (
                <div>
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Stock Quantity</label>
                  <div className="w-full rounded-lg border border-[var(--sl-blue-10)] bg-white px-3 py-2 text-xs text-gray-300">0</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Profile Tab ── */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-6">
          <h2 className="text-base font-semibold text-[var(--sl-navy)] mb-4">Client Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Business Name</p>
              <p className="text-[var(--sl-navy)]">{clientName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Industry</p>
              <p className="text-[var(--sl-navy)]">{String(client.industry || "—")}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Email</p>
              <p className="text-[var(--sl-navy)]">{String(client.notification_email || "—")}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Website</p>
              <p className="text-[var(--sl-navy)]">{String(client.website_url || "—")}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">Brand Tone</p>
              <p className="text-[var(--sl-navy)] capitalize">{String(client.brand_tone || "—")}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--sl-navy)] opacity-50 mb-1">CMS Type</p>
              <p className="text-[var(--sl-navy)]">{String(client.cms_type || "—")}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--sl-blue-10)]">
            <Link
              href="/admin/content/clients"
              className="text-sm text-[var(--sl-blue)] hover:underline"
            >
              Edit client profile on the Clients page
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
