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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-snow-dark)]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/symbol.svg" alt="Snow Leopard Labs" width={32} height={32} />
          <span className="text-white font-bold text-lg tracking-tight">Snow Leopard Labs</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-white/70 hover:text-[var(--color-snow-accent2)] transition-colors text-sm font-medium">
              {link.label}
            </Link>
          ))}
          <Link href="/contact"
            className="px-5 py-2 bg-[var(--color-snow-accent)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-snow-accent)]/80 transition-colors">
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-2"
          aria-label="Toggle menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--color-snow-dark)] border-t border-white/10 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className="block text-white/70 hover:text-[var(--color-snow-accent2)] transition-colors text-sm font-medium py-2">
              {link.label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setMobileOpen(false)}
            className="block px-5 py-2 bg-[var(--color-snow-accent)] text-white rounded-lg text-sm font-semibold text-center hover:bg-[var(--color-snow-accent)]/80 transition-colors">
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
