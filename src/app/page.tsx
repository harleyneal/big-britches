import Link from "next/link";

const features = [
  {
    icon: "M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42",
    title: "Websites That Actually Work",
    desc: "Built from scratch for your brand. No templates, no page builders, no squinting at your phone wondering why it looks weird. Just fast, clean, professional sites.",
  },
  {
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
    title: "Scheduling That Runs Itself",
    desc: "Your customers book online, you get notified, everybody's happy. No more phone tag or scribbling on sticky notes.",
  },
  {
    icon: "M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z",
    title: "Get Paid Without the Hassle",
    desc: "Stripe-powered payments and invoicing, baked right into your dashboard. Send invoices, track revenue, get paid. Simple as that.",
  },
  {
    icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z",
    title: "AI That Does the Boring Stuff",
    desc: "A chatbot that answers customer questions at 3 AM so you don't have to. Plus content tools and SEO help that actually make a difference.",
  },
];

const steps = [
  { num: "01", title: "Tell Us What You Need", desc: "Fill out a quick form or just chat with us right here. No sales pitch, no 45-minute discovery calls. Just tell us about your business and we'll figure out the rest." },
  { num: "02", title: "We Build It", desc: "We design your site and set up your dashboard with everything you need. Most projects launch in 1–3 weeks. You'll wonder why you waited so long." },
  { num: "03", title: "You Run Your Business", desc: "Your site goes live. We handle hosting, updates, and maintenance. You focus on the stuff you're actually good at." },
];

const planFeatures = [
  "Custom-designed, mobile-responsive website",
  "Admin dashboard with analytics",
  "Online scheduling & automated reminders",
  "Stripe payments & invoicing",
  "E-commerce ready",
  "AI chatbot trained on your content",
  "AI-written blog posts, published twice a week",
  "SEO, schema & performance analytics",
  "Cloud hosting, maintenance & updates included",
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-[var(--sl-navy)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--sl-navy)] via-[var(--sl-navy)] to-[var(--sl-navy)]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--sl-blue)]/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--sl-blue)]/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6 pt-16">
          <p className="text-[var(--sl-lime)] font-medium mb-4 tracking-wide uppercase text-sm">Websites, Dashboards & AI Tools for Small Business</p>
          <h1 className="text-5xl md:text-7xl font-bold text-[var(--sl-ice)] mb-6 tracking-tight leading-tight">
            We Give Small Business Big Britches.
          </h1>
          <p className="text-lg md:text-xl text-[var(--sl-ice)]/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            A gorgeous custom website, a dashboard that actually makes sense, scheduling, payments, AI tools — all for one monthly price that won&apos;t make you wince.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing"
              className="px-8 py-4 bg-[var(--sl-blue)] text-[var(--sl-ice)] rounded-full font-semibold text-lg hover:brightness-110 hover:scale-[1.04] hover:shadow-lg hover:shadow-[var(--sl-blue)]/20 active:scale-[0.98] transition-all duration-200">
              See Our Plan
            </Link>
            <Link href="/services"
              className="px-8 py-4 border border-[var(--sl-ice)]/20 text-[var(--sl-ice)] rounded-full font-semibold text-lg hover:bg-[var(--sl-ice)]/10 hover:scale-[1.04] active:scale-[0.98] transition-all duration-200">
              What&apos;s Included
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[var(--sl-ice)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[var(--sl-blue)] font-semibold text-sm uppercase tracking-wider mb-3">The Good Stuff</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--sl-navy)]">Everything You Need, Nothing You Don&apos;t</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-8 rounded-2xl bg-[var(--sl-ice)] hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-[var(--sl-blue)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--sl-blue)]/20 transition-colors">
                  <svg className="w-6 h-6 text-[var(--sl-blue)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--sl-navy)] mb-3">{f.title}</h3>
                <p className="text-[var(--sl-navy)]/60 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[var(--sl-navy)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[var(--sl-lime)] font-semibold text-sm uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--sl-ice)]">Three Steps. No Runaround.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="text-6xl font-black text-[var(--sl-blue)]/20 mb-4">{s.num}</div>
                <h3 className="text-xl font-bold text-[var(--sl-ice)] mb-3">{s.title}</h3>
                <p className="text-[var(--sl-ice)]/80 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-24 bg-[var(--sl-ice)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[var(--sl-blue)] font-semibold text-sm uppercase tracking-wider mb-3">Simple Pricing</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--sl-navy)]">One Plan. Everything Included.</h2>
          </div>
          <div className="max-w-xl mx-auto">
            <div className="relative border-2 border-[var(--sl-lime)] rounded-2xl bg-[var(--sl-navy)] p-8 md:p-10 shadow-xl">
              <div className="absolute -top-4 left-8 bg-[var(--sl-lime)] text-[var(--sl-navy)] text-xs font-bold uppercase px-4 py-1 rounded-full">
                Everything You Need
              </div>
              <div className="mb-6">
                <p className="text-[var(--sl-lime)] text-xs font-semibold uppercase tracking-widest mb-2">The Big Britches Plan</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-[var(--sl-ice)]">$37</span>
                  <span className="text-[var(--sl-ice)]">/month</span>
                </div>
                <p className="text-[var(--sl-ice)]/60 text-sm">One-time setup deposit: $300</p>
              </div>

              <ul className="space-y-3 mb-8">
                {planFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="text-[var(--sl-lime)] font-bold text-lg leading-none">&#10003;</span>
                    <span className="text-[var(--sl-ice)]">{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/pricing" className="block w-full text-center bg-[var(--sl-lime)] text-[var(--sl-navy)] font-semibold py-3.5 px-6 rounded-full hover:brightness-110 hover:scale-[1.03] hover:shadow-lg hover:shadow-[var(--sl-lime)]/20 active:scale-[0.98] transition-all duration-200">
                See Full Details
              </Link>
            </div>
            <p className="text-center mt-6 text-[var(--sl-navy)]/60 text-sm">
              Need something custom? <Link href="/contact" className="text-[var(--sl-blue)] font-semibold hover:underline">Let&apos;s talk.</Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 bg-[var(--sl-ice)]">
        <div className="absolute inset-0 bg-[var(--sl-blue)]/20" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--sl-navy)] mb-6">Ready to Look Like You Mean Business?</h2>
          <p className="text-[var(--sl-navy)]/70 text-lg mb-10 max-w-xl mx-auto">
            A professional website, a killer dashboard, and all the tools to run your business online — for less than your monthly coffee habit. Probably.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing"
              className="px-8 py-4 bg-[var(--sl-navy)] text-[var(--sl-ice)] rounded-full font-bold text-lg hover:brightness-125 hover:scale-[1.04] hover:shadow-lg hover:shadow-[var(--sl-navy)]/20 active:scale-[0.98] transition-all duration-200">
              View Pricing
            </Link>
            <Link href="/contact"
              className="px-8 py-4 border-2 border-[var(--sl-navy)] text-[var(--sl-navy)] rounded-full font-bold text-lg hover:bg-[var(--sl-navy)]/10 hover:scale-[1.04] active:scale-[0.98] transition-all duration-200">
              Let&apos;s Talk
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
