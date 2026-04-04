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
  XCircle,
  X,
  Download,
  ChevronDown,
} from "lucide-react";

/* ─── Types ─── */
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
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

const emptyLineItem = (): LineItem => ({
  id: genId(),
  description: "",
  quantity: 1,
  rate: 0,
});

const defaultInvoice = (): InvoiceData => ({
  id: genId(),
  invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
  clientName: "",
  clientEmail: "",
  clientAddress: "",
  issueDate: today(),
  dueDate: in30Days(),
  lineItems: [
    { id: genId(), description: "Service / Labor", quantity: 1, rate: 0 },
    { id: genId(), description: "Materials", quantity: 1, rate: 0 },
  ],
  taxRate: 0,
  notes: "",
  terms: "Payment is due within 30 days of the invoice date.",
  status: "draft",
  createdAt: new Date().toISOString(),
});

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-gray-600", bg: "bg-gray-100" },
  sent: { label: "Sent", color: "text-[var(--sl-blue)]", bg: "bg-[var(--sl-blue-10)]" },
  paid: { label: "Paid", color: "text-[var(--sl-lime)]", bg: "bg-[var(--sl-lime-20)]" },
  overdue: { label: "Overdue", color: "text-red-600", bg: "bg-red-100" },
  cancelled: { label: "Cancelled", color: "text-gray-400", bg: "bg-gray-50" },
};

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/* ─── Component ─── */
export default function InvoicingTab() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [editing, setEditing] = useState<InvoiceData | null>(null);
  const [previewing, setPreviewing] = useState<InvoiceData | null>(null);
  const [listFilter, setListFilter] = useState<string>("all");

  /* ── Calculations ── */
  const calcSubtotal = (items: LineItem[]) =>
    items.reduce((sum, i) => sum + i.quantity * i.rate, 0);

  const calcTax = (items: LineItem[], rate: number) =>
    calcSubtotal(items) * (rate / 100);

  const calcTotal = (items: LineItem[], rate: number) =>
    calcSubtotal(items) + calcTax(items, rate);

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
    setEditing({ ...editing, lineItems: [...editing.lineItems, emptyLineItem()] });
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    if (!editing) return;
    setEditing({
      ...editing,
      lineItems: editing.lineItems.map((li) =>
        li.id === id ? { ...li, [field]: value } : li
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

  /* ── Stats ── */
  const stats = {
    total: invoices.length,
    draft: invoices.filter((i) => i.status === "draft").length,
    sent: invoices.filter((i) => i.status === "sent").length,
    paid: invoices.filter((i) => i.status === "paid").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    totalRevenue: invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, inv) => sum + calcTotal(inv.lineItems, inv.taxRate), 0),
    outstanding: invoices
      .filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((sum, inv) => sum + calcTotal(inv.lineItems, inv.taxRate), 0),
  };

  const filteredInvoices =
    listFilter === "all" ? invoices : invoices.filter((i) => i.status === listFilter);

  /* ── Editing / Builder View ── */
  if (editing) {
    const subtotal = calcSubtotal(editing.lineItems);
    const tax = calcTax(editing.lineItems, editing.taxRate);
    const total = subtotal + tax;

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
              onClick={() => setEditing(null)}
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
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={editing.clientName}
                    onChange={(e) => setEditing({ ...editing, clientName: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={editing.clientEmail}
                    onChange={(e) => setEditing({ ...editing, clientEmail: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                    Client Address
                  </label>
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
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={editing.invoiceNumber}
                    onChange={(e) => setEditing({ ...editing, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={editing.issueDate}
                    onChange={(e) => setEditing({ ...editing, issueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editing.dueDate}
                    onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--sl-navy)]">Line Items</h3>
                <button
                  onClick={addLineItem}
                  className="flex items-center gap-1 text-xs font-medium text-[var(--sl-blue)] hover:underline"
                >
                  <Plus size={14} />
                  Add Item
                </button>
              </div>

              {/* Header row */}
              <div className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-3 mb-2 px-1">
                <span className="text-[11px] font-medium text-[var(--sl-navy)] opacity-50 uppercase tracking-wider">Description</span>
                <span className="text-[11px] font-medium text-[var(--sl-navy)] opacity-50 uppercase tracking-wider">Qty</span>
                <span className="text-[11px] font-medium text-[var(--sl-navy)] opacity-50 uppercase tracking-wider">Rate</span>
                <span className="text-[11px] font-medium text-[var(--sl-navy)] opacity-50 uppercase tracking-wider text-right">Amount</span>
                <span />
              </div>

              <div className="space-y-2">
                {editing.lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-3 items-center"
                  >
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                      placeholder="Description of work or item"
                      className="px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                    />
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value))}
                      className="px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] text-center focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--sl-navy)] opacity-40">$</span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.rate || ""}
                        onChange={(e) => updateLineItem(item.id, "rate", Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                      />
                    </div>
                    <p className="text-sm font-medium text-[var(--sl-navy)] text-right">
                      {usd(item.quantity * item.rate)}
                    </p>
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
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                    Notes (visible to client)
                  </label>
                  <textarea
                    value={editing.notes}
                    onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                    rows={2}
                    placeholder="Thank you for your business!"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                    Payment Terms
                  </label>
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

              <div className="mt-6 pt-4 border-t border-[var(--sl-blue-10)] space-y-2">
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
                    // When Stripe is wired: create Stripe Invoice + send
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
                        {usd(calcTotal(inv.lineItems, inv.taxRate))}
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
                          <FileText size={15} className="text-[var(--sl-navy)] opacity-50" />
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
  calcSubtotal,
  calcTax,
  calcTotal,
}: {
  invoice: InvoiceData;
  onClose: () => void;
  calcSubtotal: (items: LineItem[]) => number;
  calcTax: (items: LineItem[], rate: number) => number;
  calcTotal: (items: LineItem[], rate: number) => number;
}) {
  const subtotal = calcSubtotal(invoice.lineItems);
  const tax = calcTax(invoice.lineItems, invoice.taxRate);
  const total = calcTotal(invoice.lineItems, invoice.taxRate);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
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

          {/* Line Items Table */}
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b-2 border-[var(--sl-navy)]">
                <th className="text-left py-2 text-[11px] uppercase tracking-wider text-[var(--sl-navy)] font-semibold">Description</th>
                <th className="text-center py-2 text-[11px] uppercase tracking-wider text-[var(--sl-navy)] font-semibold w-20">Qty</th>
                <th className="text-right py-2 text-[11px] uppercase tracking-wider text-[var(--sl-navy)] font-semibold w-24">Rate</th>
                <th className="text-right py-2 text-[11px] uppercase tracking-wider text-[var(--sl-navy)] font-semibold w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id} className="border-b border-[var(--sl-blue-10)]">
                  <td className="py-3 text-sm text-[var(--sl-navy)]">{item.description || "—"}</td>
                  <td className="py-3 text-sm text-center text-[var(--sl-navy)] opacity-70">{item.quantity}</td>
                  <td className="py-3 text-sm text-right text-[var(--sl-navy)] opacity-70">{usd(item.rate)}</td>
                  <td className="py-3 text-sm text-right font-medium text-[var(--sl-navy)]">{usd(item.quantity * item.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>

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

          {/* Stripe notice */}
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
