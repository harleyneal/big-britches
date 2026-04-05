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

  // Invoice Template state
  const [invoiceTemplate, setInvoiceTemplate] = useState<InvoiceTemplate>({
    columns: [],
    amountFormula: { type: "manual", columnIds: [] },
    defaultTerms: "",
    defaultNotes: "",
    defaultTaxRate: 0,
  });

  // Product Schema state
  const [productSchema, setProductSchema] = useState<ProductSchema>({
    fields: [],
    enableInventory: false,
    enableVariants: false,
  });

  // Content & Social state
  const [contentData, setContentData] = useState({
    industry: "",
    target_audience: "",
    brand_tone: "",
    website_url: "",
    notification_email: "",
    auto_approve: false,
    platforms_enabled: {
      blog: false,
      facebook: false,
      instagram: false,
      google_business: false,
    },
  });

  // Fetch tenant data
  useEffect(() => {
    const fetchTenant = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tenants/${tenantId}`);
        if (!response.ok) throw new Error("Failed to fetch tenant");

        const data = await response.json();
        setTenant(data);

        // Initialize invoice template
        if (data.payment_config?.invoice_template) {
          setInvoiceTemplate(data.payment_config.invoice_template);
        }

        // Initialize product schema
        if (data.payment_config?.product_schema) {
          setProductSchema(data.payment_config.product_schema);
        }

        // Initialize content data
        setContentData({
          industry: data.industry || "",
          target_audience: data.target_audience || "",
          brand_tone: data.brand_tone || "",
          website_url: data.website_url || "",
          notification_email: data.notification_email || "",
          auto_approve: data.auto_approve || false,
          platforms_enabled: data.platforms_enabled || {
            blog: false,
            facebook: false,
            instagram: false,
            google_business: false,
          },
        });

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tenant");
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) fetchTenant();
  }, [tenantId]);

  // Save configuration
  const saveConfig = useCallback(async () => {
    if (!tenant) return;

    try {
      setSaving(true);
      setError(null);

      let payload: Record<string, any> = {};

      if (activeTab === "invoicing" || activeTab === "ecommerce") {
        payload.payment_config = {
          invoice_template: activeTab === "invoicing" ? invoiceTemplate : undefined,
          product_schema: activeTab === "ecommerce" ? productSchema : undefined,
        };
      } else if (activeTab === "content") {
        payload = contentData;
      }

      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save configuration");

      const updated = await response.json();
      setTenant(updated);
      setSuccess("Configuration saved successfully");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  }, [tenant, activeTab, invoiceTemplate, productSchema, contentData, tenantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[--sl-ice] via-white to-[--sl-blue-10] p-8">
        <div className="flex items-center justify-center h-96">
          <p className="text-[--sl-navy]">Loading tenant configuration...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[--sl-ice] via-white to-[--sl-blue-10] p-8">
        <div className="text-center">
          <p className="text-[--sl-navy] mb-4">Tenant not found</p>
          <Link href="/admin/tenants" className="text-[--sl-blue] hover:underline">
            Back to Tenants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--sl-ice] via-white to-[--sl-blue-10] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/tenants"
            className="inline-flex items-center gap-2 text-[--sl-blue] hover:text-[--sl-navy] mb-4 transition"
          >
            <ArrowLeft size={18} />
            Back to Tenants
          </Link>

          <h1 className="text-4xl font-bold text-[--sl-navy] mb-2">{tenant.name}</h1>
          <p className="text-[--sl-navy]/60">Tenant Configuration</p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-[--sl-blue-10]">
            <div className="flex overflow-x-auto">
              {(["invoicing", "ecommerce", "content", "profile"] as ConfigTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
                    activeTab === tab
                      ? "text-[--sl-navy] border-[--sl-blue]"
                      : "text-[--sl-navy]/60 border-transparent hover:text-[--sl-navy]"
                  }`}
                >
                  {tab === "invoicing" && <FileText size={18} />}
                  {tab === "ecommerce" && <Package size={18} />}
                  {tab === "content" && <Share2 size={18} />}
                  {tab === "profile" && <User size={18} />}
                  {tab === "invoicing" && "Invoice Template"}
                  {tab === "ecommerce" && "Product Fields"}
                  {tab === "content" && "Content & Social"}
                  {tab === "profile" && "Tenant Profile"}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Invoice Template Tab */}
            {activeTab === "invoicing" && (
              <InvoiceTemplateTab
                template={invoiceTemplate}
                setTemplate={setInvoiceTemplate}
              />
            )}

            {/* Product Fields Tab */}
            {activeTab === "ecommerce" && (
              <ProductSchemaTab
                schema={productSchema}
                setSchema={setProductSchema}
              />
            )}

            {/* Content & Social Tab */}
            {activeTab === "content" && (
              <ContentSocialTab
                data={contentData}
                setData={setContentData}
              />
            )}

            {/* Tenant Profile Tab */}
            {activeTab === "profile" && (
              <TenantProfileTab tenant={tenant} />
            )}

            {/* Save Button (for non-profile tabs) */}
            {activeTab !== "profile" && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[--sl-blue] text-white rounded-lg hover:bg-[--sl-navy] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Invoice Template Tab Component
function InvoiceTemplateTab({
  template,
  setTemplate,
}: {
  template: InvoiceTemplate;
  setTemplate: (template: InvoiceTemplate) => void;
}) {
  const addColumn = () => {
    const newColumn: ColumnDef = {
      id: `col_${Date.now()}`,
      name: "New Column",
      type: "text",
      width: "100px",
    };
    setTemplate({
      ...template,
      columns: [...template.columns, newColumn],
    });
  };

  const updateColumn = (id: string, updates: Partial<ColumnDef>) => {
    setTemplate({
      ...template,
      columns: template.columns.map((col) =>
        col.id === id ? { ...col, ...updates } : col
      ),
    });
  };

  const deleteColumn = (id: string) => {
    setTemplate({
      ...template,
      columns: template.columns.filter((col) => col.id !== id),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[--sl-navy] mb-4">
          Invoice Columns
        </h3>
        <div className="space-y-4">
          {template.columns.length === 0 ? (
            <p className="text-[--sl-navy]/60 py-8 text-center">No columns configured yet</p>
          ) : (
            template.columns.map((column) => (
              <div
                key={column.id}
                className="p-4 border border-[--sl-blue-10] rounded-lg space-y-3"
              >
                <div className="flex items-center gap-3">
                  <GripVertical size={18} className="text-[--sl-navy]/40 cursor-move" />
                  <input
                    type="text"
                    value={column.name}
                    onChange={(e) =>
                      updateColumn(column.id, { name: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]"
                    placeholder="Column name"
                  />
                  <select
                    value={column.type}
                    onChange={(e) =>
                      updateColumn(column.id, {
                        type: e.target.value as "text" | "number" | "currency",
                      })
                    }
                    className="px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="currency">Currency</option>
                  </select>
                  <input
                    type="text"
                    value={column.width}
                    onChange={(e) =>
                      updateColumn(column.id, { width: e.target.value })
                    }
                    className="w-24 px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]"
                    placeholder="Width"
                  />
                  <button
                    onClick={() => deleteColumn(column.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <button
          onClick={addColumn}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-[--sl-blue] border border-[--sl-blue] rounded hover:bg-[--sl-blue-10] transition"
        >
          <Plus size={18} />
          Add Column
        </button>
      </div>

      <div className="border-t border-[--sl-blue-10] pt-8">
        <h3 className="text-lg font-semibold text-[--sl-navy] mb-4">
          Amount Formula
        </h3>
        <select
          value={template.amountFormula.type}
          onChange={(e) =>
            setTemplate({
              ...template,
              amountFormula: {
                ...template.amountFormula,
                type: e.target.value as "manual" | "multiply" | "sum",
              },
            })
          }
          className="px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]"
        >
          <option value="manual">Manual</option>
          <option value="multiply">Multiply Columns</option>
          <option value="sum">Sum Columns</option>
        </select>
      </div>

      <div className="border-t border-[--sl-blue-10] pt-8 space-y-4">
        <h3 className="text-lg font-semibold text-[--sl-navy] mb-4">
          Default Values
        </h3>

        <div>
          <label className="block text-sm font-medium text-[--sl-navy] mb-2">
            Default Terms
          </label>
          <textarea
            value={template.defaultTerms}
            onChange={(e) =>
              setTemplate({ ...template, defaultTerms: e.target.value })
            }
            className="w-full px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]"
            rows={3}
            placeholder="Default payment terms..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--sl-navy] mb-2">
            Default Notes
          </label>
          <textarea
            value={template.defaultNotes}
            onChange={(e) =>
              setTemplate({ ...template, defaultNotes: e.target.value })
            }
            className="w-full px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]"
            rows={3}
            placeholder="Default invoice notes..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--sl-navy] mb-2">
            Default Tax Rate (%)
          </label>
          <input
            type="number"
            value={template.defaultTaxRate}
            onChange={(e) =>
              setTemplate({ ...template, defaultTaxRate: parseFloat(e.target.value) })
            }
            className="w-full px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]"
            step="0.01"
            min="0"
          />
        </div>
      </div>
    </div>
  );
}

// Product Schema Tab Component
function ProductSchemaTab({
  schema,
  setSchema,
}: {
  schema: ProductSchema;
  setSchema: (schema: ProductSchema) => void;
}) {
  const addField = () => {
    const newField: ProductField = {
      id: `field_${Date.now()}`,
      name: "New Field",
      key: `new_field_${Date.now()}`,
      type: "text",
      required: false,
    };
    setSchema({
      ...schema,
      fields: [...schema.fields, newField],
    });
  };

  const updateField = (id: string, updates: Partial<ProductField>) => {
    setSchema({
      ...schema,
      fields: schema.fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      ),
    });
  };

  const deleteField = (id: string) => {
    setSchema({
      ...schema,
      fields: schema.fields.filter((field) => field.id !== id),
    });
  };

  const parseOptions = (str: string): string[] => {
    return str.split("\n").filter((opt) => opt.trim());
  };

  const formatOptions = (arr: string[]): string => {
    return arr.join("\n");
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[--sl-navy] mb-4">
          Product Fields
        </h3>
        <div className="space-y-4">
          {schema.fields.length === 0 ? (
            <p className="text-[--sl-navy]/60 py-8 text-center">No fields configured yet</p>
          ) : (
            schema.fields.map((field) => (
              <div
                key={field.id}
                className="p-4 border border-[--sl-blue-10] rounded-lg space-y-3"
              >
                <div className="flex items-center gap-3 mb-3">
                  <GripVertical size={18} className="text-[--sl-navy]/40 cursor-move" />
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) =>
                      updateField(field.id, { name: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]"
                    placeholder="Field label"
                  />
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) =>
                      updateField(field.id, { key: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]"
                    placeholder="Field key (snake_case)"
                  />
                  <button
                    onClick={() => deleteField(field.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 ml-6">
                  <div>
                    <label className="block text-sm text-[--sl-navy]/60 mb-1">
                      Type
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(field.id, {
                          type: e.target.value as FieldType,
                        })
                      }
                      className="w-full px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy] text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="currency">Currency</option>
                      <option value="select">Select</option>
                      <option value="boolean">Boolean</option>
                      <option value="image">Image</option>
                      <option value="textarea">Textarea</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-[--sl-navy]">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(field.id, { required: e.target.checked })
                        }
                        className="rounded"
                      />
                      Required
                    </label>
                  </div>
                </div>

                {field.type === "select" && (
                  <div className="ml-6">
                    <label className="block text-sm text-[--sl-navy]/60 mb-1">
                      Options (one per line)
                    </label>
                    <textarea
                      value={formatOptions(field.options || [])}
                      onChange={(e) =>
                        updateField(field.id, {
                          options: parseOptions(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy] text-sm"
                      rows={2}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                )}

                <div className="ml-6">
                  <label className="block text-sm text-[--sl-navy]/60 mb-1">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={field.placeholder || ""}
                    onChange={(e) =>
                      updateField(field.id, { placeholder: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy] text-sm"
                    placeholder="Field placeholder text"
                  />
                </div>
              </div>
            ))
          )}
        </div>
        <button
          onClick={addField}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-[--sl-blue] border border-[--sl-blue] rounded hover:bg-[--sl-blue-10] transition"
        >
          <Plus size={18} />
          Add Field
        </button>
      </div>

      <div className="border-t border-[--sl-blue-10] pt-8">
        <h3 className="text-lg font-semibold text-[--sl-navy] mb-4">
          Features
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={schema.enableInventory}
              onChange={(e) =>
                setSchema({ ...schema, enableInventory: e.target.checked })
              }
              className="rounded"
            />
            <span className="text-[--sl-navy]">Enable Inventory Tracking</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={schema.enableVariants}
              onChange={(e) =>
                setSchema({ ...schema, enableVariants: e.target.checked })
              }
              className="rounded"
            />
            <span className="text-[--sl-navy]">Enable Product Variants</span>
          </label>
        </div>
      </div>

      <div className="border-t border-[--sl-blue-10] pt-8">
        <h3 className="text-lg font-semibold text-[--sl-navy] mb-4">
          Form Preview
        </h3>
        <div className="p-4 bg-[--sl-ice] rounded border border-[--sl-blue-10]">
          <p className="text-sm text-[--sl-navy]/60 mb-4">Preview of product form fields:</p>
          <div className="space-y-3">
            {schema.fields.length === 0 ? (
              <p className="text-[--sl-navy]/40">No fields to preview</p>
            ) : (
              schema.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-[--sl-navy] mb-1">
                    {field.name}
                    {field.required && <span className="text-red-600">*</span>}
                  </label>
                  {field.type === "select" && (
                    <select className="w-full px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]/60 text-sm">
                      <option>{field.placeholder || `Select ${field.name}`}</option>
                      {(field.options || []).map((opt, idx) => (
                        <option key={idx}>{opt}</option>
                      ))}
                    </select>
                  )}
                  {field.type === "textarea" && (
                    <textarea
                      className="w-full px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]/60 text-sm"
                      placeholder={field.placeholder}
                      disabled
                      rows={2}
                    />
                  )}
                  {field.type === "boolean" && (
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" disabled />
                      <span className="text-sm text-[--sl-navy]/60">{field.placeholder}</span>
                    </label>
                  )}
                  {!["select", "textarea", "boolean"].includes(field.type) && (
                    <input
                      type={field.type === "currency" ? "number" : field.type}
                      className="w-full px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]/60 text-sm"
                      placeholder={field.placeholder}
                      disabled
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Content & Social Tab Component
function ContentSocialTab({
  data,
  setData,
}: {
  data: {
    industry: string;
    target_audience: string;
    brand_tone: string;
    website_url: string;
    notification_email: string;
    auto_approve: boolean;
    platforms_enabled: Record<string, boolean>;
  };
  setData: (data: any) => void;
}) {
  const updatePlatform = (platform: string, enabled: boolean) => {
    setData({
      ...data,
      platforms_enabled: {
        ...data.platforms_enabled,
        [platform]: enabled,
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[--sl-navy] mb-2">
            Industry
          </label>
          <input
            type="text"
            value={data.industry}
            onChange={(e) => setData({ ...data, industry: e.target.value })}
            className="w-full px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]"
            placeholder="e.g., Technology, Retail, Services"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--sl-navy] mb-2">
            Target Audience
          </label>
          <input
            type="text"
            value={data.target_audience}
            onChange={(e) => setData({ ...data, target_audience: e.target.value })}
            className="w-full px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]"
            placeholder="e.g., Small businesses, Startups"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[--sl-navy] mb-2">
            Brand Tone
          </label>
          <textarea
            value={data.brand_tone}
            onChange={(e) => setData({ ...data, brand_tone: e.target.value })}
            className="w-full px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]"
            rows={3}
            placeholder="Describe the brand voice and tone..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--sl-navy] mb-2">
            Website URL
          </label>
          <input
            type="url"
            value={data.website_url}
            onChange={(e) => setData({ ...data, website_url: e.target.value })}
            className="w-full px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--sl-navy] mb-2">
            Notification Email
          </label>
          <input
            type="email"
            value={data.notification_email}
            onChange={(e) => setData({ ...data, notification_email: e.target.value })}
            className="w-full px-3 py-2 border border-[--sl-blue-10] rounded text-[--sl-navy]"
            placeholder="notifications@example.com"
          />
        </div>
      </div>

      <div className="border-t border-[--sl-blue-10] pt-8">
        <h3 className="text-lg font-semibold text-[--sl-navy] mb-4">
          Auto-Approval
        </h3>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={data.auto_approve}
            onChange={(e) => setData({ ...data, auto_approve: e.target.checked })}
            className="rounded"
          />
          <span className="text-[--sl-navy]">Automatically approve content submissions</span>
        </label>
      </div>

      <div className="border-t border-[--sl-blue-10] pt-8">
        <h3 className="text-lg font-semibold text-[--sl-navy] mb-4">
          Enabled Platforms
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-3 border border-[--sl-blue-10] rounded cursor-pointer hover:bg-[--sl-ice] transition">
            <input
              type="checkbox"
              checked={data.platforms_enabled.blog || false}
              onChange={(e) => updatePlatform("blog", e.target.checked)}
              className="rounded"
            />
            <span className="text-[--sl-navy]">Blog</span>
          </label>

          <label className="flex items-center gap-3 p-3 border border-[--sl-blue-10] rounded cursor-pointer hover:bg-[--sl-ice] transition">
            <input
              type="checkbox"
              checked={data.platforms_enabled.facebook || false}
              onChange={(e) => updatePlatform("facebook", e.target.checked)}
              className="rounded"
            />
            <span className="text-[--sl-navy]">Facebook</span>
          </label>

          <label className="flex items-center gap-3 p-3 border border-[--sl-blue-10] rounded cursor-pointer hover:bg-[--sl-ice] transition">
            <input
              type="checkbox"
              checked={data.platforms_enabled.instagram || false}
              onChange={(e) => updatePlatform("instagram", e.target.checked)}
              className="rounded"
            />
            <span className="text-[--sl-navy]">Instagram</span>
          </label>

          <label className="flex items-center gap-3 p-3 border border-[--sl-blue-10] rounded cursor-pointer hover:bg-[--sl-ice] transition">
            <input
              type="checkbox"
              checked={data.platforms_enabled.google_business || false}
              onChange={(e) => updatePlatform("google_business", e.target.checked)}
              className="rounded"
            />
            <span className="text-[--sl-navy]">Google Business</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// Tenant Profile Tab Component
function TenantProfileTab({ tenant }: { tenant: TenantData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-semibold text-[--sl-navy]/60 uppercase tracking-wide mb-2">
            Name
          </h4>
          <p className="text-lg text-[--sl-navy] font-medium">{tenant.name}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[--sl-navy]/60 uppercase tracking-wide mb-2">
            Slug
          </h4>
          <p className="text-lg text-[--sl-navy] font-mono">{tenant.slug || "—"}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[--sl-navy]/60 uppercase tracking-wide mb-2">
            Industry
          </h4>
          <p className="text-lg text-[--sl-navy]">{tenant.industry || "—"}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[--sl-navy]/60 uppercase tracking-wide mb-2">
            Plan
          </h4>
          <p className="text-lg text-[--sl-navy]">
            <span className="inline-block px-3 py-1 bg-[--sl-lime-20] text-[--sl-navy] rounded-full text-sm font-medium">
              {tenant.plan || "Standard"}
            </span>
          </p>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-sm font-semibold text-[--sl-navy]/60 uppercase tracking-wide mb-2">
            Email
          </h4>
          <p className="text-lg text-[--sl-navy] font-mono">{tenant.notification_email || "—"}</p>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-sm font-semibold text-[--sl-navy]/60 uppercase tracking-wide mb-2">
            Website
          </h4>
          {tenant.website_url ? (
            <a
              href={tenant.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-[--sl-blue] hover:text-[--sl-navy] break-all"
            >
              {tenant.website_url}
            </a>
          ) : (
            <p className="text-lg text-[--sl-navy]">—</p>
          )}
        </div>

        <div className="md:col-span-2">
          <h4 className="text-sm font-semibold text-[--sl-navy]/60 uppercase tracking-wide mb-2">
            Custom Domain
          </h4>
          <p className="text-lg text-[--sl-navy]">{tenant.custom_domain || "—"}</p>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-sm font-semibold text-[--sl-navy]/60 uppercase tracking-wide mb-2">
            Brand Tone
          </h4>
          <p className="text-lg text-[--sl-navy] whitespace-pre-wrap">
            {tenant.brand_tone || "—"}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[--sl-navy]/60 uppercase tracking-wide mb-2">
            Created
          </h4>
          <p className="text-lg text-[--sl-navy]">
            {tenant.created_at
              ? new Date(tenant.created_at).toLocaleDateString()
              : "—"}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[--sl-navy]/60 uppercase tracking-wide mb-2">
            Updated
          </h4>
          <p className="text-lg text-[--sl-navy]">
            {tenant.updated_at
              ? new Date(tenant.updated_at).toLocaleDateString()
              : "—"}
          </p>
        </div>
      </div>

      <div className="border-t border-[--sl-blue-10] pt-8">
        <h4 className="text-sm font-semibold text-[--sl-navy]/60 uppercase tracking-wide mb-4">
          Tenant ID
        </h4>
        <p className="text-sm text-[--sl-navy] font-mono bg-[--sl-ice] p-3 rounded border border-[--sl-blue-10]">
          {tenant.id}
        </p>
      </div>

      <div className="rounded-lg bg-[--sl-blue-10] p-4 border border-[--sl-blue] text-[--sl-navy] text-sm">
        This is a read-only view of the tenant profile. To edit these details, use the Invoice Template,
        Product Fields, or Content & Social tabs.
      </div>
    </div>
  );
}