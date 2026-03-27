"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--sl-navy)]/95 backdrop-blur-md border-b border-[var(--sl-ice)]/10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-dark.svg" alt="Big Britches" width={200} height={44} className="h-11 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-[var(--sl-ice)]/70 hover:text-[var(--sl-lime)] transition-colors text-sm font-medium">
              {link.label}
            </Link>
          ))}
          <Link href="/contact"
            className="px-6 py-2.5 bg-[var(--sl-blue)] text-[var(--sl-ice)] rounded-full text-sm font-semibold hover:brightness-110 hover:scale-[1.04] hover:shadow-md hover:shadow-[var(--sl-blue)]/20 active:scale-[0.98] transition-all duration-200">
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-[var(--sl-ice)] p-2" aria-label="Toggle menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden mobile-menu-enter bg-[var(--sl-navy)]/90 backdrop-blur-xl border-t border-[var(--sl-ice)]/10 px-6 pt-6 pb-8">
          <div className="space-y-1">
            {navLinks.map((link, i) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="mobile-menu-item block text-[var(--sl-ice)]/80 hover:text-[var(--sl-ice)] hover:bg-[var(--sl-ice)]/5 transition-all duration-200 text-base font-medium py-3 px-4 rounded-xl"
                style={{ animationDelay: `${i * 50}ms` }}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-[var(--sl-ice)]/10 mobile-menu-item" style={{ animationDelay: `${navLinks.length * 50}ms` }}>
            <Link href="/contact" onClick={() => setMobileOpen(false)}
              className="block py-3.5 bg-[var(--sl-blue)] text-[var(--sl-ice)] rounded-full text-base font-semibold text-center hover:brightness-110 active:scale-[0.98] transition-all duration-200">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
