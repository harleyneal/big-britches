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
          A small deposit to get the ball rolling, then a simple monthly subscription
          that covers everything — website, dashboard, tools, hosting, maintenance.
          No surprise invoices. No nickel-and-diming.
        </p>
      </div>

      {/* Pricing Card Section */}
      <div className="px-4 py-16 md:py-24">
        <div className="max-w-xl mx-auto">
          <div className="relative border-2 border-[var(--sl-lime)] rounded-2xl bg-[var(--sl-navy)] p-8 md:p-10 shadow-xl">
            <div className="absolute -top-4 left-8 bg-[var(--sl-lime)] text-[var(--sl-navy)] text-xs font-bold uppercase px-4 py-1 rounded-full">
              Everything You Need
            </div>

            <div className="mb-8">
              <p className="text-[var(--sl-lime)] text-xs font-semibold uppercase tracking-widest mb-2">
                The Big Britches Plan
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--sl-ice)] mb-4">
                Your Business, Online &amp; Running
              </h2>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-[var(--sl-ice)]">$37</span>
                <span className="text-[var(--sl-ice)]">/month</span>
              </div>
              <p className="text-[var(--sl-ice)] text-sm mb-4">
                One-time setup deposit: <span className="font-semibold">$300</span>
              </p>
            </div>

            <ul className="space-y-3 mb-10">
              {[
                "Custom-designed, mobile-responsive website (up to 10 pages)",
                "Admin dashboard with analytics & business overview",
                "Online scheduling & booking with automated reminders",
                "Stripe payment processing & invoicing",
                "Order & job tracking",
                "E-commerce ready (product catalog, cart, checkout)",
                "AI chatbot trained on your content",
                "AI-written blog posts published twice a week",
                "Blog / content management system",
                "SEO setup, schema & performance analytics",
                "Google Analytics integration",
                "Cloud hosting, maintenance & security updates included",
                "Email & chat support (24-hr response)",

              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">&#10003;</span>
                  <span className="text-[var(--sl-ice)]">{item}</span>
                </li>
              ))}
            </ul>

            <Link href="/contact" className="block w-full text-center bg-[var(--sl-lime)] text-[var(--sl-navy)] font-semibold py-3.5 px-6 rounded-full hover:brightness-110 hover:scale-[1.03] hover:shadow-lg hover:shadow-[var(--sl-lime)]/20 active:scale-[0.98] transition-all duration-200">
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Projects CTA */}
      <div className="px-4 py-16 md:py-20 border-t border-[var(--sl-ice)]/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--sl-ice)] mb-4">
            Need Something Custom?
          </h2>
          <p className="text-[var(--sl-ice)]/80 text-lg mb-8 leading-relaxed">
            Got a bigger project in mind — a custom web app, advanced integrations,
            or something we haven&apos;t thought of yet? Let&apos;s talk. We love a good challenge.
          </p>
          <Link href="/contact" className="inline-block px-8 py-4 border-2 border-[var(--sl-lime)] text-[var(--sl-lime)] rounded-full font-semibold text-lg hover:bg-[var(--sl-lime)]/10 hover:scale-[1.04] active:scale-[0.98] transition-all duration-200">
            Let&apos;s Talk
          </Link>
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
                Most projects launch in 1–3 weeks depending on scope. Either way, faster than you&apos;d expect.
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
