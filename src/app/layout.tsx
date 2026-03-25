import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Snow Leopard LLC | Professional Web Design for Small Businesses",
  description:
    "Custom web design and development for small businesses. Low deposit, simple monthly subscription, big professional impact. CRM, e-commerce, AI tools, and more.",
  keywords: [
    "web design",
    "small business website",
    "web development",
    "affordable web design",
    "CRM",
    "e-commerce",
  ],
  openGraph: {
    title: "Snow Leopard LLC | Professional Web Design for Small Businesses",
    description:
      "Custom web design and development for small businesses. Low deposit, simple monthly subscription, big professional impact.",
    url: "https://www.snowleopardllc.io",
    siteName: "Snow Leopard LLC",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
