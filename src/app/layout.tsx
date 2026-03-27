import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Big Britches LLC | Websites & Tools for Small Businesses That Mean Business",
  description:
    "Custom websites, dashboards, scheduling, payments, and AI tools — all in one ridiculously affordable subscription. We give small business big britches.",
  keywords: ["web design", "small business website", "web development", "affordable web design", "business dashboard", "AI tools"],
  icons: { icon: "/symbol.svg" },
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
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-[var(--sl-ice)] text-[var(--sl-navy)]">
        <ParticleBackground />
        {/* Global half-face watermark — fixed on every page */}
        <div
          className="fixed top-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: '-18vw',
            width: '65vh',
            height: '68vh',
            opacity: 0.06,
            zIndex: 5,
          }}
        >
          <img
            src="/symbol.svg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-contain"
            style={{ filter: 'brightness(3)' }}
          />
        </div>
        <Navbar />
        <main className="relative">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
