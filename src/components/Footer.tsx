import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[var(--sl-navy)] text-[var(--sl-ice)]/60 border-t border-[var(--sl-ice)]/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image src="/logo-dark.svg" alt="Snow Leopard Labs" width={140} height={28} className="h-7 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed">
              Professional web design &amp; development for small businesses. Big impact, simple pricing.
            </p>
          </div>
          <div>
            <h4 className="text-[var(--sl-ice)] font-semibold text-sm mb-4 uppercase tracking-wider">Company</h4>
            <div className="space-y-2">
              {[["About", "/about"], ["Services", "/services"], ["Pricing", "/pricing"], ["Contact", "/contact"]].map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm hover:text-[var(--sl-lime)] transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[var(--sl-ice)] font-semibold text-sm mb-4 uppercase tracking-wider">Services</h4>
            <div className="space-y-2">
              {["Website Design", "Web Applications", "CRM Integration", "E-Commerce", "SEO & Analytics", "AI Tools"].map((item) => (
                <span key={item} className="block text-sm">{item}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[var(--sl-ice)] font-semibold text-sm mb-4 uppercase tracking-wider">Get In Touch</h4>
            <div className="space-y-2 text-sm">
              <p>info@snowleopardllc.io</p>
              <Link href="/contact" className="inline-block mt-3 px-5 py-2 bg-[var(--sl-blue)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--sl-blue)]/80 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[var(--sl-ice)]/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">&copy; {new Date().getFullYear()} Snow Leopard Labs LLC. All rights reserved.</p>
          <p className="text-xs">Built with purpose in the age of AI.</p>
        </div>
      </div>
    </footer>
  );
}
