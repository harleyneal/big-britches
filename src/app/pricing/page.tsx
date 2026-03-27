import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--sl-navy)]">
      {/* Header Section */}
      <div className="px-4 py-16 md:py-24 text-center border-b border-[var(--sl-ice)]">
        <p className="text-[var(--sl-lime)] text-sm font-semibold uppercase tracking-wide mb-4">
          Pricing That Makes Sense
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--sl-ice)] mb-6">
          One Price. The Whole Enchilada.
        </h1>
        <p className="text-lg text-[var(--sl-ice)] max-w-2xl mx-auto">
          A small deposit to get the ball rolling, then a simple monthly subscription that covers everything — website, dashboard, tools, hosting, maintenance. No surprise invoices. No nickel-and-diming.
        </p>
      </div>

      {/* Pricing Cards Section */}
      <div className="px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Startup Tier */}
          <div className="relative border-2 border-[var(--sl-blue)] rounded-lg bg-[var(--sl-ice)] p-8 md:p-10">
            <div className="mb-8">
              <p className="text-[var(--sl-navy)] text-xs font-semibold uppercase tracking-widest mb-2">
                Startup
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--sl-navy)] mb-4">
                For Businesses Just Getting Started
              </h2>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-[var(--sl-navy)]">$29</span>
                <span className="text-[var(--sl-navy)]">/month</span>
              </div>
              <p className="text-[var(--sl-navy)] text-sm mb-4">
                Deposit: <span className="font-semibold">$299–$499</span>
              </p>
            </div>

            <ul className="space-y-3 mb-10">
              {[
                "Custom-designed, mobile-responsive website (up to 5 pages)",
                "Admin dashboard with business overview",
                "Online scheduling & booking page",
                "Stripe payment processing",
                "Basic invoicing",
                "Order & job tracking",
                "AI chatbot for customer inquiries",
                "Basic SEO setup (meta tags, sitemap, schema)",
                "Google Analytics integration",
                "Cloud hosting, maintenance & security updates included",
                "Email & chat support (24-hr response)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">&#10003;</span>
                  <span className="text-[var(--sl-navy)]">{item}</span>
                </li>
              ))}
            </ul>

            <Link href="/contact" className="block w-full text-center bg-[var(--sl-blue)] text-[var(--sl-ice)] font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>

          {/* Business Tier */}
          <div className="relative border-2 border-[var(--sl-lime)] rounded-lg bg-[var(--sl-navy)] p-8 md:p-10 shadow-xl">
            <div className="absolute -top-4 left-8 bg-[var(--sl-lime)] text-[var(--sl-navy)] text-xs font-bold uppercase px-4 py-1 rounded-full">
              Most Popular
            </div>

            <div className="mb-8">
              <p className="text-[var(--sl-lime)] text-xs font-semibold uppercase tracking-widest mb-2">
                Business
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--sl-ice)] mb-4">
                For Businesses Ready to Level Up
              </h2>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-[var(--sl-ice)]">$79–$99</span>
                <span className="text-[var(--sl-ice)]">/month</span>
              </div>
              <p className="text-[var(--sl-ice)] text-sm mb-4">
                Deposit: <span className="font-semibold">$599–$999</span>
              </p>
            </div>

            <ul className="space-y-3 mb-10">
              {[
                "Everything in Startup, plus:",
                "Expanded website (15+ pages) or custom web application",
                "Advanced admin dashboard with analytics",
                "E-commerce (product catalog, cart, checkout)",
                "Advanced invoicing & revenue reports",
                "Custom booking flows & automated reminders",
                "AI chatbot with custom training on your content",
                "Advanced SEO & performance analytics",
                "Blog / content management system",
                "User authentication & member areas",
                "Email & chat support (24-hr response)",
                "Quarterly performance review & optimization",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">&#10003;</span>
                  <span className="text-[var(--sl-ice)]">{item}</span>
                </li>
              ))}
            </ul>

            <Link href="/contact" className="block w-full text-center bg-[var(--sl-lime)] text-[var(--sl-navy)] font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-4 py-16 md:py-24 border-t border-[var(--sl-ice)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--sl-ice)] text-center mb-12">
            The Stuff You&apos;re Probably Wondering
          </h2>

          <div className="space-y-8">
            <div className="border-b border-[var(--sl-blue)] pb-6">
              <h3 className="text-lg font-semibold text-[var(--sl-lime)] mb-3">What&apos;s the deposit for?</h3>
              <p className="text-[var(--sl-ice)]">
                It covers the upfront design and development work — building your site from scratch, setting up your dashboard, the whole shebang. It&apos;s a one-time thing, not recurring.
              </p>
            </div>

            <div className="border-b border-[var(--sl-blue)] pb-6">
              <h3 className="text-lg font-semibold text-[var(--sl-lime)] mb-3">Can I cancel anytime?</h3>
              <p className="text-[var(--sl-ice)]">
                Yep. No contracts, no guilt trips. Your site stays live through the end of your billing period. We keep you around by being good at what we do, not by locking you in.
              </p>
            </div>

            <div className="border-b border-[var(--sl-blue)] pb-6">
              <h3 className="text-lg font-semibold text-[var(--sl-lime)] mb-3">How fast can I get up and running?</h3>
              <p className="text-[var(--sl-ice)]">
                Startup sites usually ship in 1–2 weeks. Business tier projects with e-commerce or custom features take 2–4 weeks. Either way, faster than you&apos;d expect.
              </p>
            </div>

            <div className="border-b border-[var(--sl-blue)] pb-6">
              <h3 className="text-lg font-semibold text-[var(--sl-lime)] mb-3">Do I own my website?</h3>
              <p className="text-[var(--sl-ice)]">
                100%. Your content, your design, your data. If you ever leave, we&apos;ll hand everything over. No hostage situations here.
              </p>
            </div>

            <div className="border-b border-[var(--sl-blue)] pb-6">
              <h3 className="text-lg font-semibold text-[var(--sl-lime)] mb-3">Do I need my own Stripe account?</h3>
              <p className="text-[var(--sl-ice)]">
                Nope. We set it up through Stripe Connect — payments go straight to your bank account, and you manage everything from your dashboard. Easy peasy.
              </p>
            </div>

            <div className="pb-6">
              <h3 className="text-lg font-semibold text-[var(--sl-lime)] mb-3">What about changes after launch?</h3>
              <p className="text-[var(--sl-ice)]">
                Small tweaks and content updates are included in your subscription. Bigger feature additions? We&apos;ll scope those out as add-on projects with clear pricing. No surprises.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
