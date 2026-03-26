import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--sl-navy)]">
      {/* Header Section */}
      <div className="px-4 py-16 md:py-24 text-center border-b border-[var(--sl-ice)]">
        <p className="text-[var(--sl-lime)] text-sm font-semibold uppercase tracking-wide mb-4">
          Simple, Transparent Pricing
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--sl-ice)] mb-6">
          One Subscription. Everything Included.
        </h1>
        <p className="text-lg text-[var(--sl-ice)] max-w-2xl mx-auto">
          A small deposit to get started, then a simple monthly subscription that covers your website, dashboard, scheduling, payments, and AI tools. No hidden fees.
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
                For New & Small Businesses
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
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-navy)]">Custom-designed, mobile-responsive website (up to 5 pages)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-navy)]">Admin dashboard with business overview</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-navy)]">Online scheduling & booking page</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-navy)]">Stripe payment processing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-navy)]">Basic invoicing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-navy)]">Order & job tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-navy)]">AI chatbot for customer inquiries</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-navy)]">Basic SEO setup (meta tags, sitemap, schema)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-navy)]">Google Analytics integration</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-navy)]">Monthly maintenance & security updates</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-navy)]">Email & chat support (48-hr response)</span>
              </li>
            </ul>

            <button className="w-full bg-[var(--sl-blue)] text-[var(--sl-ice)] font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
              Get Started
            </button>
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
                For Growing Companies
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
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-ice)]">Everything in Startup, plus:</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-ice)]">Expanded website (15+ pages) or custom web application</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-ice)]">Advanced admin dashboard with analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-ice)]">E-commerce (product catalog, cart, checkout)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-ice)]">Advanced invoicing & revenue reports</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-ice)]">Custom booking flows & automated reminders</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-ice)]">AI chatbot with custom training on your content</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-ice)]">Advanced SEO & performance analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-ice)]">Blog / content management system</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-ice)]">User authentication & member areas</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-ice)]">Priority support (24-hr response) + monthly strategy session</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--sl-lime)] font-bold text-lg mt-0.5">✓</span>
                <span className="text-[var(--sl-ice)]">Quarterly performance review & optimization</span>
              </li>
            </ul>

            <button className="w-full bg-[var(--sl-lime)] text-[var(--sl-navy)] font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-4 py-16 md:py-24 border-t border-[var(--sl-ice)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--sl-ice)] text-center mb-12">
            Questions? We've Got Answers.
          </h2>

          <div className="space-y-8">
            {/* FAQ Item 1 */}
            <div className="border-b border-[var(--sl-blue)] pb-6">
              <h3 className="text-lg font-semibold text-[var(--sl-lime)] mb-3">
                What does the deposit cover?
              </h3>
              <p className="text-[var(--sl-ice)]">
                The deposit covers the initial design and development of your website and dashboard. It's a one-time payment that kicks off the project — we handle everything from design to launch.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="border-b border-[var(--sl-blue)] pb-6">
              <h3 className="text-lg font-semibold text-[var(--sl-lime)] mb-3">
                Can I cancel my subscription?
              </h3>
              <p className="text-[var(--sl-ice)]">
                Yes, you can cancel anytime. Your site remains live through the end of your billing period. We don't believe in locking you in — we earn your business every month.
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div className="border-b border-[var(--sl-blue)] pb-6">
              <h3 className="text-lg font-semibold text-[var(--sl-lime)] mb-3">
                How long does it take to get set up?
              </h3>
              <p className="text-[var(--sl-ice)]">
                Startup sites are typically ready in 1–2 weeks. Business tier projects with e-commerce or custom features take 2–4 weeks depending on complexity.
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="border-b border-[var(--sl-blue)] pb-6">
              <h3 className="text-lg font-semibold text-[var(--sl-lime)] mb-3">
                Do I own my website?
              </h3>
              <p className="text-[var(--sl-ice)]">
                Absolutely. You own all your content, design assets, and data. If you ever leave, we'll provide a full export of everything.
              </p>
            </div>

            {/* FAQ Item 5 */}
            <div className="border-b border-[var(--sl-blue)] pb-6">
              <h3 className="text-lg font-semibold text-[var(--sl-lime)] mb-3">
                Do I need my own Stripe account?
              </h3>
              <p className="text-[var(--sl-ice)]">
                No. We handle the setup through Stripe Connect — your payments flow directly to your bank account, and everything is managed through your dashboard.
              </p>
            </div>

            {/* FAQ Item 6 */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-[var(--sl-lime)] mb-3">
                What if I need changes after launch?
              </h3>
              <p className="text-[var(--sl-ice)]">
                Your subscription includes ongoing maintenance and updates. Small content changes are included. Larger feature additions can be scoped as add-on projects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}