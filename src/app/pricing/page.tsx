import Link from "next/link";

const starterFeatures = [
  "Custom-designed, mobile-responsive website (up to 5 pages)",
  "Professional branding integration",
  "High-performance cloud hosting",
  "SSL certificate & custom domain setup",
  "Basic SEO setup (meta tags, sitemap, schema)",
  "Social media links & embedded feeds",
  "Contact form with email notifications",
  "Google Analytics integration",
  "Monthly maintenance & security updates",
  "Email & chat support (48-hr response)",
];

const businessFeatures = [
  "Everything in Starter, plus:",
  "Expanded website (15+ pages) or web application",
  "Built-in CRM dashboard",
  "E-commerce (catalog, cart, Stripe/PayPal checkout)",
  "Social media management hub",
  "AI-powered chatbot & SEO assistant",
  "Advanced analytics dashboard",
  "Blog / content management system",
  "Email marketing integration",
  "User authentication & member areas",
  "Priority support (24-hr response) + monthly strategy call",
  "Quarterly performance review & optimization",
];
const faqs = [
  { q: "What does the deposit cover?", a: "The deposit covers the initial design and development of your website. It\u2019s a one-time payment that kicks off the project \u2014 we handle everything from design mockups to a fully launched site." },
  { q: "Can I cancel my subscription?", a: "Yes, you can cancel anytime. Your site remains live through the end of your billing period. We don\u2019t believe in locking you in \u2014 we earn your business every month." },
  { q: "How long does it take to build my site?", a: "Starter sites are typically ready in 1\u20132 weeks. Business tier projects with CRM, e-commerce, or custom features take 2\u20134 weeks depending on complexity." },
  { q: "Do I own my website?", a: "Absolutely. You own all your content, design assets, and data. If you ever leave, we\u2019ll provide a full export of everything." },
  { q: "What if I need changes after launch?", a: "Your subscription includes ongoing maintenance and updates. Small content changes are included. Larger feature additions can be scoped as add-on projects." },
];

export default function Pricing() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-[var(--sl-navy)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[var(--sl-lime)] font-semibold text-sm uppercase tracking-wider mb-3">Simple, Transparent Pricing</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--sl-ice)] mb-6">Invest a Little, Impact a Lot</h1>
          <p className="text-[var(--sl-ice)]/60 text-lg max-w-2xl mx-auto">
            A small deposit to get started, then a simple monthly subscription that covers everything. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-[var(--sl-ice)]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Starter */}
          <div className="bg-[var(--sl-ice)] rounded-2xl p-10 shadow-sm border border-[var(--sl-navy)]/10 flex flex-col">
            <p className="text-[var(--sl-blue)] font-semibold text-sm uppercase tracking-wider mb-2">Starter</p>
            <h3 className="text-2xl font-bold text-[var(--sl-navy)] mb-1">For Individuals & Small Businesses</h3>            <div className="mt-6 mb-2">
              <span className="text-4xl font-black text-[var(--sl-navy)]">$29</span>
              <span className="text-[var(--sl-navy)]/50">/month</span>
            </div>
            <p className="text-sm text-[var(--sl-navy)]/50 mb-8">$299 – $499 one-time deposit</p>
            <ul className="space-y-3 mb-10 flex-1">
              {starterFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-[var(--sl-navy)]">
                  <svg className="w-5 h-5 text-[var(--sl-lime)] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="block text-center px-6 py-3 border-2 border-[var(--sl-blue)] text-[var(--sl-blue)] rounded-xl font-semibold hover:bg-[var(--sl-blue)] hover:text-[var(--sl-ice)] transition-all">
              Get Started
            </Link>
          </div>

          {/* Business */}
          <div className="bg-[var(--sl-navy)] rounded-2xl p-10 shadow-xl border border-[var(--sl-ice)]/10 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[var(--sl-lime)] text-[var(--sl-navy)] text-xs font-bold px-4 py-1.5 rounded-bl-xl">Most Popular</div>
            <p className="text-[var(--sl-lime)] font-semibold text-sm uppercase tracking-wider mb-2">Business</p>
            <h3 className="text-2xl font-bold text-[var(--sl-ice)] mb-1">For Growing Companies & Web Apps</h3>
            <div className="mt-6 mb-2">
              <span className="text-4xl font-black text-[var(--sl-ice)]">$79 – $99</span>
              <span className="text-[var(--sl-ice)]/50">/month</span>
            </div>
            <p className="text-sm text-[var(--sl-ice)]/40 mb-8">$599 – $999 one-time deposit</p>            <ul className="space-y-3 mb-10 flex-1">
              {businessFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-[var(--sl-ice)]/80">
                  <svg className="w-5 h-5 text-[var(--sl-lime)] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="block text-center px-6 py-3 bg-[var(--sl-lime)] text-[var(--sl-navy)] rounded-xl font-bold hover:bg-[var(--sl-lime)]/80 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[var(--sl-ice)]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[var(--sl-navy)] text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-b border-[var(--sl-navy)]/10 pb-6">
                <h3 className="text-lg font-semibold text-[var(--sl-navy)] mb-2">{faq.q}</h3>
                <p className="text-[var(--sl-navy)]/60 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}