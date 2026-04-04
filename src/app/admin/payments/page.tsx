"use client";

import { useState } from "react";
import { FileText, ShoppingCart } from "lucide-react";
import InvoicingTab from "./InvoicingTab";
import EcommerceTab from "./EcommerceTab";

type PaymentTab = "invoicing" | "ecommerce";

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<PaymentTab>("invoicing");

  const tabs: { key: PaymentTab; label: string; icon: React.ElementType; description: string }[] = [
    {
      key: "invoicing",
      label: "Invoicing",
      icon: FileText,
      description: "Create and send custom invoices to your clients",
    },
    {
      key: "ecommerce",
      label: "E-Commerce",
      icon: ShoppingCart,
      description: "Manage products, orders, and your online store",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--sl-navy)]">Payments</h1>
        <p className="text-[var(--sl-navy)] opacity-60 mt-1">
          Manage invoicing and e-commerce for your business
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 transition-all text-left flex-1 max-w-xs ${
                isActive
                  ? "border-[var(--sl-blue)] bg-[var(--sl-blue-10)]"
                  : "border-[var(--sl-blue-10)] bg-white hover:border-[var(--sl-blue-20)] hover:shadow-sm"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? "bg-[var(--sl-blue)] text-white" : "bg-[var(--sl-ice)] text-[var(--sl-navy)]"
                }`}
              >
                <Icon size={20} />
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    isActive ? "text-[var(--sl-blue)]" : "text-[var(--sl-navy)]"
                  }`}
                >
                  {tab.label}
                </p>
                <p className="text-xs text-[var(--sl-navy)] opacity-50">{tab.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "invoicing" ? <InvoicingTab /> : <EcommerceTab />}
    </div>
  );
}
