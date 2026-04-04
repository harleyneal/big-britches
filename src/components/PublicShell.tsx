"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import ChatWidget from "@/components/ChatWidget";
import TradingGridOverlay from "@/components/TradingGridOverlay";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/auth");
  const isDashboardRoute = isAdminRoute || isAuthRoute;

  // Admin and auth routes get a clean shell — no public site chrome
  if (isDashboardRoute) {
    return <>{children}</>;
  }

  // Public pages get the full marketing site wrapper
  return (
    <>
      <TradingGridOverlay />
      <ParticleBackground />
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}
