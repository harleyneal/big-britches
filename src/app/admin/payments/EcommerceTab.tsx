"use client";

import { useState } from "react";
import {
  Plus,
  Package,
  ShoppingCart,
  Trash2,
  Edit3,
  X,
  Eye,
  Search,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";

/* ─── Types ─── */
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
  category: string;
  inventory: number;
  active: boolean;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { productName: string; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  createdAt: string;
}

type EcomView = "products" | "orders";

/* ─── Helpers ─── */
const genId = () => Math.random().toString(36).slice(2, 10);
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const orderStatusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-yellow-600", bg: "bg-yellow-50", icon: Clock },
  processing: { label: "Processing", color: "text-[var(--sl-blue)]", bg: "bg-[var(--sl-blue-10)]", icon: Package },
  shipped: { label: "Shipped", color: "text-purple-600", bg: "bg-purple-50", icon: Truck },
  delivered: { label: "Delivered", color: "text-[var(--sl-lime)]", bg: "bg-[var(--sl-lime-20)]", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-500", bg: "bg-red-50", icon: XCircle },
  refunded: { label: "Refunded", color: "text-gray-500", bg: "bg-gray-100", icon: DollarSign },
};

const defaultProduct = (): Product => ({
  id: genId(),
  name: "",
  description: "",
  price: 0,
  compareAtPrice: null,
  imageUrl: "",
  category: "",
  inventory: 0,
  active: true,
  createdAt: new Date().toISOString(),
});

/* ─── Component ─── */
export default function EcommerceTab() {
  const [view, setView] = useState<EcomView>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");

  /* ── Product Actions ── */
  const saveProduct = () => {
    if (!editingProduct) return;
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === editingProduct.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = editingProduct;
        return updated;
      }
      return [editingProduct, ...prev];
    });
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleProductActive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  /* ── Stats ── */
  const productStats = {
    total: products.length,
    active: products.filter((p) => p.active).length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.inventory, 0),
  };

  const orderStats = {
    total: orders.length,
    revenue: orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + o.total, 0),
    pending: orders.filter((o) => o.status === "pending" || o.status === "processing").length,
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders =
    orderFilter === "all" ? orders : orders.filter((o) => o.status === orderFilter);

  /* ── Product Editor Modal ── */
  if (editingProduct) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--sl-navy)]">
            {products.find((p) => p.id === editingProduct.id) ? "Edit Product" : "New Product"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={saveProduct}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--sl-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Package size={16} />
              Save Product
            </button>
            <button
              onClick={() => setEditingProduct(null)}
              className="p-2 rounded-lg text-[var(--sl-navy)] opacity-40 hover:opacity-100 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Product details */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Premium T-Shirt"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                  Description
                </label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  placeholder="Describe your product..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={editingProduct.imageUrl}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                />
                <p className="text-[10px] text-[var(--sl-navy)] opacity-30 mt-1">
                  Image uploads via Supabase coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Right: Pricing & Inventory */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--sl-navy)]">Pricing</h3>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--sl-navy)] opacity-40">$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={editingProduct.price || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">
                  Compare at Price <span className="opacity-50">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--sl-navy)] opacity-40">$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={editingProduct.compareAtPrice ?? ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        compareAtPrice: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--sl-navy)]">Inventory & Organization</h3>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Category</label>
                <input
                  type="text"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  placeholder="e.g. Apparel, Electronics"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sl-navy)] opacity-60 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  min={0}
                  value={editingProduct.inventory}
                  onChange={(e) => setEditingProduct({ ...editingProduct, inventory: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-[var(--sl-navy)]">Active</span>
                <button
                  onClick={() => setEditingProduct({ ...editingProduct, active: !editingProduct.active })}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    editingProduct.active ? "bg-[var(--sl-blue)]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      editingProduct.active ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={saveProduct}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--sl-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Package size={16} />
              Save Product
            </button>
            <p className="text-[10px] text-center text-[var(--sl-navy)] opacity-30">
              Stripe Products sync coming soon
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main View ── */
  return (
    <div className="space-y-6">
      {/* Sub-tabs: Products / Orders */}
      <div className="flex items-center justify-between">
        <div className="flex bg-white rounded-lg border border-[var(--sl-blue-10)] p-1">
          <button
            onClick={() => setView("products")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === "products"
                ? "bg-[var(--sl-blue)] text-white"
                : "text-[var(--sl-navy)] opacity-60 hover:opacity-100"
            }`}
          >
            <Package size={16} />
            Products
          </button>
          <button
            onClick={() => setView("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === "orders"
                ? "bg-[var(--sl-blue)] text-white"
                : "text-[var(--sl-navy)] opacity-60 hover:opacity-100"
            }`}
          >
            <ShoppingCart size={16} />
            Orders
          </button>
        </div>

        {view === "products" && (
          <button
            onClick={() => setEditingProduct(defaultProduct())}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--sl-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Add Product
          </button>
        )}
      </div>

      {/* ── Products View ── */}
      {view === "products" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-[var(--sl-blue-10)]">
              <div className="flex items-center gap-2 mb-2">
                <Package size={16} className="text-[var(--sl-blue)]" />
                <span className="text-xs text-[var(--sl-navy)] opacity-50">Total Products</span>
              </div>
              <p className="text-xl font-bold text-[var(--sl-navy)]">{productStats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[var(--sl-blue-10)]">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-[var(--sl-lime)]" />
                <span className="text-xs text-[var(--sl-navy)] opacity-50">Active</span>
              </div>
              <p className="text-xl font-bold text-[var(--sl-navy)]">{productStats.active}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[var(--sl-blue-10)]">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-[var(--sl-lime)]" />
                <span className="text-xs text-[var(--sl-navy)] opacity-50">Inventory Value</span>
              </div>
              <p className="text-xl font-bold text-[var(--sl-navy)]">{usd(productStats.totalValue)}</p>
            </div>
          </div>

          {/* Search */}
          {products.length > 0 && (
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sl-navy)] opacity-30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--sl-blue-10)] text-sm text-[var(--sl-navy)] placeholder:text-gray-300 focus:outline-none focus:border-[var(--sl-blue)] transition-colors"
              />
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-12 text-center">
              <Package size={40} className="mx-auto text-[var(--sl-navy)] opacity-15 mb-3" />
              <p className="text-sm font-medium text-[var(--sl-navy)] opacity-60">
                {products.length === 0 ? "No products yet" : "No products match your search"}
              </p>
              <p className="text-xs text-[var(--sl-navy)] opacity-30 mt-1 mb-4">
                Add products that your customers can purchase through their website
              </p>
              {products.length === 0 && (
                <button
                  onClick={() => setEditingProduct(defaultProduct())}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--sl-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus size={16} />
                  Add First Product
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-[var(--sl-blue-10)] overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="h-40 bg-[var(--sl-ice)] flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={32} className="text-[var(--sl-navy)] opacity-15" />
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--sl-navy)]">{product.name || "Untitled"}</h3>
                        {product.category && (
                          <p className="text-xs text-[var(--sl-navy)] opacity-40">{product.category}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          product.active
                            ? "bg-[var(--sl-lime-20)] text-[var(--sl-lime)]"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {product.active ? "Active" : "Draft"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold text-[var(--sl-navy)]">{usd(product.price)}</span>
                      {product.compareAtPrice && (
                        <span className="text-sm line-through text-[var(--sl-navy)] opacity-30">
                          {usd(product.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--sl-navy)] opacity-40">
                        {product.inventory} in stock
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingProduct({ ...product })}
                          className="p-1.5 rounded-lg hover:bg-[var(--sl-blue-10)] transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={14} className="text-[var(--sl-blue)]" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Orders View ── */}
      {view === "orders" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-[var(--sl-blue-10)]">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart size={16} className="text-[var(--sl-blue)]" />
                <span className="text-xs text-[var(--sl-navy)] opacity-50">Total Orders</span>
              </div>
              <p className="text-xl font-bold text-[var(--sl-navy)]">{orderStats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[var(--sl-blue-10)]">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-[var(--sl-lime)]" />
                <span className="text-xs text-[var(--sl-navy)] opacity-50">Revenue</span>
              </div>
              <p className="text-xl font-bold text-[var(--sl-navy)]">{usd(orderStats.revenue)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[var(--sl-blue-10)]">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-yellow-500" />
                <span className="text-xs text-[var(--sl-navy)] opacity-50">Pending / Processing</span>
              </div>
              <p className="text-xl font-bold text-[var(--sl-navy)]">{orderStats.pending}</p>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex gap-2">
            {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((f) => (
              <button
                key={f}
                onClick={() => setOrderFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  orderFilter === f
                    ? "bg-[var(--sl-blue)] text-white"
                    : "bg-white border border-[var(--sl-blue-10)] text-[var(--sl-navy)] opacity-60 hover:opacity-100"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] p-12 text-center">
              <ShoppingCart size={40} className="mx-auto text-[var(--sl-navy)] opacity-15 mb-3" />
              <p className="text-sm font-medium text-[var(--sl-navy)] opacity-60">
                {orders.length === 0 ? "No orders yet" : "No orders match this filter"}
              </p>
              <p className="text-xs text-[var(--sl-navy)] opacity-30 mt-1">
                Orders from your customers&apos; websites will appear here once Stripe Checkout is connected
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[var(--sl-blue-10)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[var(--sl-ice)] border-b border-[var(--sl-blue-10)]">
                  <tr>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--sl-navy)] uppercase tracking-wider">Order</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--sl-navy)] uppercase tracking-wider">Customer</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--sl-navy)] uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--sl-navy)] uppercase tracking-wider">Date</th>
                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-[var(--sl-navy)] uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sl-blue-10)]">
                  {filteredOrders.map((order) => {
                    const sc = orderStatusConfig[order.status];
                    return (
                      <tr key={order.id} className="hover:bg-[var(--sl-ice)] transition-colors">
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-[var(--sl-navy)]">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-[var(--sl-navy)] opacity-40">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-sm text-[var(--sl-navy)]">{order.customerName}</p>
                          <p className="text-xs text-[var(--sl-navy)] opacity-40">{order.customerEmail}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${sc.bg} ${sc.color}`}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-[var(--sl-navy)] opacity-60">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <p className="text-sm font-semibold text-[var(--sl-navy)]">{usd(order.total)}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
