import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import PublicShell from "@/components/PublicShell";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Big Britches LLC | Websites & Tools for Small Businesses That Mean Business",
  description:
    "Custom websites, dashboards, scheduling, payments, and AI tools — all in one ridiculously affordable subscription. We give small business big britches.",
  keywords: ["web design", "small business website", "web development", "affordable web design", "business dashboard", "AI tools"],
  icons: {
    icon: [
      { url: "/symbol-dark.svg", media: "(prefers-color-scheme: light)" },
      { url: "/symbol-light.svg", media: "(prefers-color-scheme: dark)" },
    ],
  },
  openGraph: {
    title: "Big Britches LLC | Websites & Tools for Small Businesses That Mean Business",
    description: "Custom websites, dashboards, scheduling, payments, and AI tools — all in one ridiculously affordable subscription.",
    url: "https://www.bigbritches.io",
    siteName: "Big Britches LLC",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="antialiased bg-[var(--sl-ice)] text-[var(--sl-navy)]">
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}
