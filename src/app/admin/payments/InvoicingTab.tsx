"use client";

import { useState } from "react";
import {
  Plus,
  FileText,
  Send,
  Eye,
  Trash2,
  DollarSign,
  Clock,
  CheckCircle,
  X,
  Download,
  Settings,
  GripVertical,
  Edit3,
} from "lucide-react";

/* ─── Types ─── */
type ColumnType = "text" | "number" | "currency";

interface ColumnDef {
  id: string;
  name: string;
  type: ColumnType;
  width: string; // Tailwind width class or px
}

interface LineItem {
  id: string;
  values: Record<string, string | number>; // keyed by column id
}

interface AmountFormula {
  type: "manual" | "multiply" | "sum" | "custom";
  // For "multiply": multiply these column ids together
  // For "sum": add these column ids together
  // For "custom": a formula string like "(col1 * col2) + col3"
  columnIds: string[];
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  columns: ColumnDef[];
  amountFormula: AmountFormula;
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  terms: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  createdAt: string;
}

/* ─── Helpers ─── */
const genId = () => Math.random().toString(36).slice(2, 10);

const today = () => new Date().toISOString().split("T")[0];
const in30Days = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
};

const defaultColumns = (): ColumnDef[] => [
  { id: "desc", name: "Description", type: "text", width: "1fr" },
  { id: "qty", name: "Qty", type: "number", width: "80px" },
  { id: "rate", name: "Rate", type: "currency", width: "110px" },
];

const defaultFormula = (): AmountFormula => ({
  type: "multiply",
  columnIds: ["qty", "rate"],
});

const emptyLineItem = (columns: ColumnDef[]): LineItem => {
  const values: Record<string, string | number> = {};
  columns.forEach((col) => {
    values[col.id] = col.type === "text" ? "" : 0;
  });
  return { id: genId(), values };
};

const defaultInvoice = (): InvoiceData => {
  const columns = defaultColumns();
  return {
    id: genId(),
    invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    issueDate: today(),
    dueDate: in30Days(),
    columns,
    amountFormula: defaultFormula(),
    lineItems: [
      {
        id: genId(),
        values: { desc: "Service / Labor", qty: 1, rate: 0 },
      },
      {
        id: genId(),
        values: { desc: "Materials", qty: 1, rate: 0 },
      },
    ],
    taxRate: 0,
    notes: "",
    terms: "Payment is due within 30 days of the invoice date.",
    status: "draft",
    createdAt: new Date().toISOString(),
  };
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-gray-600", bg: "bg-gray-100" },
  sent: { label: "Sent", color: "text-[var(--sl-blue)]", bg: "bg-[var(--sl-blue-10)]" },
  paid: { label: "Paid", color: "text-[var(--sl-lime)]", bg: "bg-[var(--sl-lime-20)]" },
  overdue: { label: "Overdue", color: "text-red-600", bg: "bg-red-100" },
  cancelled: { label: "Cancelled", color: "text-gray-400", bg: "bg-gray-50" },
};

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/* Calculate line item amount based on formula */
function calcLineAmount(item: LineItem, formula: AmountFormula): number {
  const getNum = (colId: string) => Number(item.values[colId]) || 0;

  switch (formula.type) {
    case "multiply":
      return formula.columnIds.reduce((acc, colId) => acc * getNum(colId), 1);
    case "sum":
      return formula.columnIds.reduce((acc, colId) => acc + getNum(colId), 0);
    case "manual":
      return getNum(formula.columnIds[0] || "");
    default:
      return 0;
  }
}

/* ─── Column Type Labels ─── */
const columnTypeLabels: Record<ColumnType, string> = {
  text: "Text",
  number: "Number",
  currency: "Currency ($)",
};

/* ─── Component ─── */
export default function InvoicingTab() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [editing, setEditing] = useState<InvoiceData | null>(null);
  const [previewing, setPreviewing] = useState<InvoiceData | null>(null);
  const [listFilter, setListFilter] = useState<string>("all");
  const [showColumnEditor, setShowColumnEditor] = useState(false);

  /* ── Calculations ── */
  const calcSubtotal = (items: LineItem[], formula: AmountFormula) =>
    items.reduce((sum, item) => sum + calcLineAmount(item, formula), 0);

  const calcTax = (items: LineItem[], formula: AmountFormula, rate: number) =>
    calcSubtotal(items, formula) * (rate / 100);

  const calcTotal = (items: LineItem[], formula: AmountFormula, rate: number) =>
    calcSubtotal(items, formula) + calcTax(items, formula, rate);

  /* ── Actions ── */
  const startNew = () => setEditing(defaultInvoice());

  const saveInvoice = () => {
    if (!editing) return;
    setInvoices((prev) => {
      const idx = prev.findIndex((inv) => inv.id === editing.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = editing;
        return updated;
      }
      return [editing, ...prev];
    });
    setEditing(null);
    setShowColumnEditor(false);
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const markStatus = (id: string, status: InvoiceData["status"]) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
  };

  /* ── Line item helpers ── */
  const addLineItem = () => {
    if (!editing) return;
    setEditing({
      ...editing,
      lineItems: [...editing.lineItems, emptyLineItem(editing.columns)],
    });
  };

  const updateLineItemValue = (itemId: string, colId: string, value: string | number) => {
    if (!editing) return;
    setEditing({
      ...editing,
      lineItems: editing.lineItems.map((li) =>
        li.id === itemId ? { ...li, values: { ...li.values, [colId]: value } } : li
      ),
    });
  };

  const removeLineItem = (id: string) => {
    if (!editing) return;
    if (editing.lineItems.length <= 1) return;
    setEditing({
      ...editing,
      lineItems: editing.lineItems.filter((li) => li.id !== id),
    });
  };

  /* ── Column management ── */
  const addColumn = () => {
    if (!editing) return;
    const newCol: ColumnDef = {
      id: genId(),
      name: "New Column",
      type: "number",
      width: "100px",
    };
    const updatedItems = editing.lineItems.map((li) => ({
      ...li,
      values: { ...li.values, [newCol.id]: 0 },
    }));
    setEditing({
      ...editing,
      columns: [...editing.columns, newCol],
      lineItems: updatedItems,
    });
  };

  const updateColumn = (colId: string, updates: Partial<ColumnDef>) => {
    if (!editing) return;
    setEditing({
      ...editing,
      columns: editing.columns.map((col) =>
        col.id === colId ? { ...col, ...updates } : col
      ),
    });
  };

  const removeColumn = (colId: string) => {
    if (!editing) return;
    if (editing.columns.length <= 1) return;
    const updatedItems = editing.lineItems.map((li) => {
      const { [colId]: _, ...rest } = li.values;
      return { ...li, values: rest };
    });
    // Also remove from formula if present
    const updatedFormula = {
      ...editing.amountFormula,
      columnIds: editing.amountFormula.columnIds.filter((id) => id !== colId),
    };
    setEditing({
      ...editing,
      columns: editing.columns.filter((col) => col.id !== colId),
      lineItems: updatedItems,
      amountFormula: updatedFormula,
    });
  };

  const toggleFormulaColumn = (colId: string) => {
    if (!editing) return;
    const current = editing.amountFormula.columnIds;
    const updated = current.includes(colId)
      ? current.filter((id) => id !== colId)
      : [...current, colId];
    setEditing({
      ...editing,
      amountFormula: { ...editing.amountFormula, columnIds: updated },
    });
  };

  /* ── Stats ── */
  const stats = {
    total: invoices.length,
    draft: invoices.filter((i) => i.status === "draft").length,
    sent: invoices.filter((i) => i.status === "sent").length,
    paid: invoices.filter((i) => i.status === "paid").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    totalRevenue: invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, inv) => sum + calcTotal(inv.lineItems, inv.amountFormula, inv.taxRate), 0),
    outstanding: invoices
      .filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((sum, inv) => sum + calcTotal(inv.lineItems, inv.amountFormula, inv.taxRate), 0),
  };

  const filteredInvoices =
    listFilter === "all" ? invoices : invoices.filter((i) => i.status === listFilter);

  /* ── Build grid template from columns ── */
  const buildGridTemplate = (cols: ColumnDef[]) => {
    const colWidths = cols.map((c) => c.width).join(" ");
    return `${colWidths} 90px 32px`; // + Amount + delete button
  };

  /* ── Editing / Builder View ── */
  if (editing) {
    const subtotal = calcSubtotal(editing.lineItems, editing.amountFormula);
    const tax = calcTax(editing.lineItems, editing.amountFormula, editing.taxRate);
    const total = subtotal + tax;
    const gridTemplate = buildGridTemplate(editing.columns);
    const numericColumns = editing.columns.filter((c) => c.type === "number" || c.type === "currency");

    return (
      <div className="space-y-6">
        {/* Builder Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--sl-navy)]">
              {invoices.find((i) => i.id === editing.id) ? "Edit Invoice" : "New Invoice"}
            </h2>
            <p className="text-sm text-[var(--sl-navy)] opacity-50 mt-0.5">
              {editing.invoiceNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewing(editing)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm font-medium text-[var(--sl-navy)] hover:bg-[var(--sl-ice)] transition-colors"
            >
              <Eye size={16} />
              Preview
            </button>
            <button
              onClick={saveInvoice}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--sl-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <FileText size={16} />
              Save Invoice
            </button>
            <button
              onClick={() => { setEditing(null); setShowColumnEditor(false); }}
              className="p-2 rounded-lg text-[var(--sl-navy)] opacity-40 hover:opacity-100 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form — 2/3 */}
          <div className="lg:col-span-2 space-y-5">
            {/* Client Info */}
            <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5">
              <h3 className="text-sm font-semibold text-[var(--sl-navy)] mb-4">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={editing.clientName}
                    onChange={(e) => setEditing({ ...editing, clientName: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Client Email</label>
                  <input
                    type="email"
                    value={editing.clientEmail}
                    onChange={(e) => setEditing({ ...editing, clientEmail: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Client Address</label>
                  <input
                    type="text"
                    value={editing.clientAddress}
                    onChange={(e) => setEditing({ ...editing, clientAddress: e.target.value })}
                    placeholder="123 Main St, City, State 12345"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5">
              <h3 className="text-sm font-semibold text-[var(--sl-navy)] mb-4">Invoice Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={editing.invoiceNumber}
                    onChange={(e) => setEditing({ ...editing, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={editing.issueDate}
                    onChange={(e) => setEditing({ ...editing, issueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editing.dueDate}
                    onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Line Items — Dynamic Columns */}
            <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--sl-navy)]">Line Items</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowColumnEditor(!showColumnEditor)}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                      showColumnEditor
                        ? "text-[var(--sl-blue)]"
                        : "text-[var(--sl-navy)] opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Settings size={14} />
                    Customize Columns
                  </button>
                  <button
                    onClick={addLineItem}
                    className="flex items-center gap-1 text-xs font-medium text-[var(--sl-blue)] hover:underline"
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Column Editor Panel */}
              {showColumnEditor && (
                <div className="mb-5 p-4 bg-[var(--sl-ice)] rounded-lg border border-[var(--sl-blue-10)]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-[var(--sl-navy)]">Column Setup</p>
                    <button
                      onClick={addColumn}
                      className="flex items-center gap-1 text-xs font-medium text-[var(--sl-blue)] hover:underline"
                    >
                      <Plus size={12} />
                      Add Column
                    </button>
                  </div>

                  <div className="space-y-2">
                    {editing.columns.map((col) => (
                      <div key={col.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[var(--sl-blue-10)]">
                        <GripVertical size={14} className="text-gray-300 shrink-0" />
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) => updateColumn(col.id, { name: e.target.value })}
                          className="flex-1 px-2 py-1 rounded border border-[var(--sl-blue-10)] text-xs text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)]"
                          placeholder="Column name"
                        />
                        <select
                          value={col.type}
                          onChange={(e) => updateColumn(col.id, { type: e.target.value as ColumnType })}
                          className="px-2 py-1 rounded border border-[var(--sl-blue-10)] text-xs text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="currency">Currency ($)</option>
                        </select>
                        <select
                          value={col.width}
                          onChange={(e) => updateColumn(col.id, { width: e.target.value })}
                          className="px-2 py-1 rounded border border-[var(--sl-blue-10)] text-xs text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white w-20"
                        >
                          <option value="1fr">Wide</option>
                          <option value="140px">Medium</option>
                          <option value="110px">Normal</option>
                          <option value="80px">Narrow</option>
                        </select>
                        <button
                          onClick={() => removeColumn(col.id)}
                          disabled={editing.columns.length <= 1}
                          className="p-1 rounded text-gray-300 hover:text-red-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          title="Remove column"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Amount Formula */}
                  <div className="mt-4 pt-3 border-t border-[var(--sl-blue-10)]">
                    <p className="text-xs font-semibold text-[var(--sl-navy)] mb-2">
                      Amount Calculation
                    </p>
                    <div className="flex items-center gap-3 mb-2">
                      <select
                        value={editing.amountFormula.type}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            amountFormula: {
                              ...editing.amountFormula,
                              type: e.target.value as AmountFormula["type"],
                            },
                          })
                        }
                        className="px-2 py-1.5 rounded border border-[var(--sl-blue-10)] text-xs text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] bg-white"
                      >
                        <option value="multiply">Multiply columns</option>
                        <option value="sum">Add columns</option>
                        <option value="manual">Manual entry</option>
                      </select>
                    </div>

                    {editing.amountFormula.type !== "manual" && (
                      <div className="flex flex-wrap gap-2">
                        {numericColumns.map((col) => {
                          const isSelected = editing.amountFormula.columnIds.includes(col.id);
                          return (
                            <button
                              key={col.id}
                              onClick={() => toggleFormulaColumn(col.id)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                                isSelected
                                  ? "bg-[var(--sl-blue)] text-white"
                                  : "bg-white border border-[var(--sl-blue-10)] text-[var(--sl-navy)] opacity-60"
                              }`}
                            >
                              {col.name}
                            </button>
                          );
                        })}
                        {numericColumns.length === 0 && (
                          <p className="text-[10px] text-[var(--sl-navy)] opacity-40">
                            Add number or currency columns to use in the formula
                          </p>
                        )}
                      </div>
                    )}

                    {editing.amountFormula.type !== "manual" && editing.amountFormula.columnIds.length >= 2 && (
                      <p className="text-[10px] text-[var(--sl-navy)] opacity-40 mt-2">
                        Amount = {editing.amountFormula.columnIds
                          .map((id) => editing.columns.find((c) => c.id === id)?.name || id)
                          .join(editing.amountFormula.type === "multiply" ? " × " : " + ")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Header row — dynamic */}
              <div
                className="grid gap-3 mb-2 px-1"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {editing.columns.map((col) => (
                  <span
                    key={col.id}
                    className="text-[11px] font-medium text-[var(--sl-navy)] opacity-50 uppercase tracking-wider"
                  >
                    {col.name}
                  </span>
                ))}
                <span className="text-[11px] font-medium text-[var(--sl-navy)] opacity-50 uppercase tracking-wider text-right">
                  Amount
                </span>
                <span />
              </div>

              {/* Line item rows — dynamic */}
              <div className="space-y-2">
                {editing.lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 items-center"
                    style={{ gridTemplateColumns: gridTemplate }}
                  >
                    {editing.columns.map((col) => {
                      if (col.type === "text") {
                        return (
                          <input
                            key={col.id}
                            type="text"
                            value={String(item.values[col.id] || "")}
                            onChange={(e) => updateLineItemValue(item.id, col.id, e.target.value)}
                            placeholder={col.name}
                            className="px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors min-w-0"
                          />
                        );
                      }
                      if (col.type === "currency") {
                        return (
                          <div key={col.id} className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--sl-navy)] opacity-40">$</span>
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={Number(item.values[col.id]) || ""}
                              onChange={(e) => updateLineItemValue(item.id, col.id, Number(e.target.value))}
                              placeholder="0.00"
                              className="w-full pl-7 pr-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                            />
                          </div>
                        );
                      }
                      // number
                      return (
                        <input
                          key={col.id}
                          type="number"
                          min={0}
                          step={1}
                          value={Number(item.values[col.id]) || ""}
                          onChange={(e) => updateLineItemValue(item.id, col.id, Number(e.target.value))}
                          placeholder="0"
                          className="px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] text-center placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                        />
                      );
                    })}

                    {/* Calculated amount */}
                    <p className="text-sm font-medium text-[var(--sl-navy)] text-right">
                      {usd(calcLineAmount(item, editing.amountFormula))}
                    </p>

                    {/* Delete row */}
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5">
              <h3 className="text-sm font-semibold text-[var(--sl-navy)] mb-4">Notes & Terms</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Notes (visible to client)</label>
                  <textarea
                    value={editing.notes}
                    onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                    rows={2}
                    placeholder="Thank you for your business!"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Payment Terms</label>
                  <textarea
                    value={editing.terms}
                    onChange={(e) => setEditing({ ...editing, terms: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary — 1/3 */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5 sticky top-20">
              <h3 className="text-sm font-semibold text-[var(--sl-navy)] mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--sl-navy)] opacity-60">Subtotal</span>
                  <span className="font-medium text-[var(--sl-navy)]">{usd(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--sl-navy)] opacity-60">Tax</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={editing.taxRate || ""}
                      onChange={(e) => setEditing({ ...editing, taxRate: Number(e.target.value) })}
                      placeholder="0"
                      className="w-16 px-2 py-1 rounded border border-[var(--sl-blue-10)] text-xs text-center text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)]"
                    />
                    <span className="text-xs text-[var(--sl-navy)] opacity-40">%</span>
                  </div>
                  <span className="font-medium text-[var(--sl-navy)]">{usd(tax)}</span>
                </div>
                <div className="border-t border-[var(--sl-blue-10)] pt-3 flex justify-between">
                  <span className="font-semibold text-[var(--sl-navy)]">Total</span>
                  <span className="text-lg font-bold text-[var(--sl-navy)]">{usd(total)}</span>
                </div>
              </div>

              {/* Column info badge */}
              <div className="mt-4 px-3 py-2 bg-[var(--sl-ice)] rounded-lg">
                <p className="text-[10px] text-[var(--sl-navy)] opacity-50">
                  <span className="font-medium">{editing.columns.length} columns</span>
                  {" · "}
                  Amount: {editing.amountFormula.type === "manual"
                    ? "manual entry"
                    : editing.amountFormula.columnIds
                        .map((id) => editing.columns.find((c) => c.id === id)?.name || "?")
                        .join(editing.amountFormula.type === "multiply" ? " × " : " + ")
                  }
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--sl-blue-10)] space-y-2">
                <button
                  onClick={saveInvoice}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--sl-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <FileText size={16} />
                  Save as Draft
                </button>
                <button
                  onClick={() => {
                    saveInvoice();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-[var(--sl-lime)] text-[var(--sl-navy)] text-sm font-medium hover:bg-[var(--sl-lime-20)] transition-colors"
                >
                  <Send size={16} />
                  Send Invoice
                </button>
                <p className="text-[10px] text-center text-[var(--sl-navy)] opacity-30 mt-1">
                  Stripe integration coming soon
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {previewing && (
          <InvoicePreviewModal
            invoice={previewing}
            onClose={() => setPreviewing(null)}
            calcLineAmount={calcLineAmount}
            calcSubtotal={calcSubtotal}
            calcTax={calcTax}
            calcTotal={calcTotal}
          />
        )}
      </div>
    );
  }

  /* ── List View ── */
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[var(--sl-blue-10)]">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-[var(--sl-lime)]" />
            <span className="text-xs text-[var(--sl-navy)] opacity-50">Revenue (Paid)</span>
          </div>
          <p className="text-xl font-bold text-[var(--sl-navy)]">{usd(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[var(--sl-blue-10)]">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-[var(--sl-blue)]" />
            <span className="text-xs text-[var(--sl-navy)] opacity-50">Outstanding</span>
          </div>
          <p className="text-xl font-bold text-[var(--sl-navy)]">{usd(stats.outstanding)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[var(--sl-blue-10)]">
          <div className="flex items-center gap-2 mb-2">
            <Send size={16} className="text-[var(--sl-blue)]" />
            <span className="text-xs text-[var(--sl-navy)] opacity-50">Sent</span>
          </div>
          <p className="text-xl font-bold text-[var(--sl-navy)]">{stats.sent}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[var(--sl-blue-10)]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-[var(--sl-lime)]" />
            <span className="text-xs text-[var(--sl-navy)] opacity-50">Paid</span>
          </div>
          <p className="text-xl font-bold text-[var(--sl-navy)]">{stats.paid}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["all", "draft", "sent", "paid", "overdue"].map((f) => (
            <button
              key={f}
              onClick={() => setListFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                listFilter === f
                  ? "bg-[var(--sl-blue)] text-white"
                  : "bg-white border border-[var(--sl-blue-10)] text-[var(--sl-navy)] opacity-60 hover:opacity-100"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--sl-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Invoice
        </button>
      </div>

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-12 text-center">
          <FileText size={40} className="mx-auto text-[var(--sl-navy)] opacity-15 mb-3" />
          <p className="text-sm font-medium text-[var(--sl-navy)] opacity-60">
            {invoices.length === 0 ? "No invoices yet" : "No invoices match this filter"}
          </p>
          <p className="text-xs text-[var(--sl-navy)] opacity-30 mt-1 mb-4">
            Create your first invoice to get started
          </p>
          {invoices.length === 0 && (
            <button
              onClick={startNew}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--sl-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Create Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--sl-ice)] border-b border-[var(--sl-blue-10)]">
              <tr>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--sl-navy)] uppercase tracking-wider">Invoice</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--sl-navy)] uppercase tracking-wider">Client</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--sl-navy)] uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--sl-navy)] uppercase tracking-wider">Due Date</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-[var(--sl-navy)] uppercase tracking-wider">Amount</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-[var(--sl-navy)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sl-blue-10)]">
              {filteredInvoices.map((inv) => {
                const sc = statusConfig[inv.status];
                return (
                  <tr key={inv.id} className="hover:bg-[var(--sl-ice)] transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-[var(--sl-navy)]">{inv.invoiceNumber}</p>
                      <p className="text-[10px] text-[var(--sl-navy)] opacity-30">{inv.columns.length} columns</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-[var(--sl-navy)]">{inv.clientName || "—"}</p>
                      <p className="text-xs text-[var(--sl-navy)] opacity-40">{inv.clientEmail}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--sl-navy)] opacity-60">
                      {new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p className="text-sm font-semibold text-[var(--sl-navy)]">
                        {usd(calcTotal(inv.lineItems, inv.amountFormula, inv.taxRate))}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setPreviewing(inv)}
                          className="p-1.5 rounded-lg hover:bg-[var(--sl-blue-10)] transition-colors"
                          title="Preview"
                        >
                          <Eye size={15} className="text-[var(--sl-blue)]" />
                        </button>
                        <button
                          onClick={() => setEditing({ ...inv })}
                          className="p-1.5 rounded-lg hover:bg-[var(--sl-blue-10)] transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={15} className="text-[var(--sl-navy)] opacity-50" />
                        </button>
                        {inv.status === "draft" && (
                          <button
                            onClick={() => markStatus(inv.id, "sent")}
                            className="p-1.5 rounded-lg hover:bg-[var(--sl-lime-20)] transition-colors"
                            title="Mark as Sent"
                          >
                            <Send size={15} className="text-[var(--sl-lime)]" />
                          </button>
                        )}
                        {(inv.status === "sent" || inv.status === "overdue") && (
                          <button
                            onClick={() => markStatus(inv.id, "paid")}
                            className="p-1.5 rounded-lg hover:bg-[var(--sl-lime-20)] transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle size={15} className="text-[var(--sl-lime)]" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteInvoice(inv.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewing && (
        <InvoicePreviewModal
          invoice={previewing}
          onClose={() => setPreviewing(null)}
          calcLineAmount={calcLineAmount}
          calcSubtotal={calcSubtotal}
          calcTax={calcTax}
          calcTotal={calcTotal}
        />
      )}
    </div>
  );
}

/* ─── Invoice Preview Modal ─── */
function InvoicePreviewModal({
  invoice,
  onClose,
  calcLineAmount,
  calcSubtotal,
  calcTax,
  calcTotal,
}: {
  invoice: InvoiceData;
  onClose: () => void;
  calcLineAmount: (item: LineItem, formula: AmountFormula) => number;
  calcSubtotal: (items: LineItem[], formula: AmountFormula) => number;
  calcTax: (items: LineItem[], formula: AmountFormula, rate: number) => number;
  calcTotal: (items: LineItem[], formula: AmountFormula, rate: number) => number;
}) {
  const subtotal = calcSubtotal(invoice.lineItems, invoice.amountFormula);
  const tax = calcTax(invoice.lineItems, invoice.amountFormula, invoice.taxRate);
  const total = calcTotal(invoice.lineItems, invoice.amountFormula, invoice.taxRate);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal header */}
        <div className="sticky top-0 bg-[var(--sl-navy)] text-white p-5 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-bold">Invoice Preview</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-sm hover:bg-white/20 transition-colors">
              <Download size={14} />
              PDF
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice body */}
        <div className="p-8">
          {/* Top: Invoice number & dates */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[var(--sl-navy)]">INVOICE</h1>
              <p className="text-sm text-[var(--sl-navy)] opacity-50 mt-1">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right text-sm text-[var(--sl-navy)]">
              <p>
                <span className="opacity-50">Issued: </span>
                {new Date(invoice.issueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
              <p>
                <span className="opacity-50">Due: </span>
                {new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-wider text-[var(--sl-navy)] opacity-40 mb-1">Bill To</p>
            <p className="text-sm font-medium text-[var(--sl-navy)]">{invoice.clientName || "—"}</p>
            {invoice.clientEmail && <p className="text-sm text-[var(--sl-navy)] opacity-60">{invoice.clientEmail}</p>}
            {invoice.clientAddress && <p className="text-sm text-[var(--sl-navy)] opacity-60">{invoice.clientAddress}</p>}
          </div>

          {/* Line Items Table — Dynamic Columns */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[var(--sl-navy)]">
                  {invoice.columns.map((col) => (
                    <th
                      key={col.id}
                      className={`py-2 text-[11px] uppercase tracking-wider text-[var(--sl-navy)] font-semibold ${
                        col.type === "text" ? "text-left" : "text-right"
                      }`}
                      style={{ minWidth: col.width === "1fr" ? "120px" : col.width }}
                    >
                      {col.name}
                    </th>
                  ))}
                  <th className="py-2 text-[11px] uppercase tracking-wider text-[var(--sl-navy)] font-semibold text-right w-24">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--sl-blue-10)]">
                    {invoice.columns.map((col) => (
                      <td
                        key={col.id}
                        className={`py-3 text-sm text-[var(--sl-navy)] ${
                          col.type === "text" ? "text-left" : "text-right opacity-70"
                        }`}
                      >
                        {col.type === "currency"
                          ? usd(Number(item.values[col.id]) || 0)
                          : String(item.values[col.id] || "—")}
                      </td>
                    ))}
                    <td className="py-3 text-sm text-right font-medium text-[var(--sl-navy)]">
                      {usd(calcLineAmount(item, invoice.amountFormula))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--sl-navy)] opacity-60">Subtotal</span>
                <span className="text-[var(--sl-navy)]">{usd(subtotal)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--sl-navy)] opacity-60">Tax ({invoice.taxRate}%)</span>
                  <span className="text-[var(--sl-navy)]">{usd(tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t-2 border-[var(--sl-navy)] pt-2">
                <span className="text-[var(--sl-navy)]">Total</span>
                <span className="text-[var(--sl-navy)]">{usd(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {invoice.notes && (
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-wider text-[var(--sl-navy)] opacity-40 mb-1">Notes</p>
              <p className="text-sm text-[var(--sl-navy)] opacity-70">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[var(--sl-navy)] opacity-40 mb-1">Terms</p>
              <p className="text-sm text-[var(--sl-navy)] opacity-70">{invoice.terms}</p>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-[var(--sl-blue-10)] text-center">
            <p className="text-xs text-[var(--sl-navy)] opacity-30">
              Payment processing powered by Stripe — integration coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
