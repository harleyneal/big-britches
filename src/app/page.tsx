import Link from "next/link";

const features = [
  {
    icon: "M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42",
    title: "Custom Design, Not Templates",
    desc: "Every site is built from scratch to match your brand. No cookie-cutter templates — your business is unique and your website should be too.",
  },
  {
    icon: "M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z",
    title: "All-In-One Platform",
    desc: "Website, CRM, social media, analytics, and e-commerce — manage your entire online presence from a single dashboard.",
  },
  {
    icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z",
    title: "AI-Powered Tools",
    desc: "Smart chatbots for customer inquiries, an SEO assistant, and content suggestions — built right into your site.",
  },
  {
    icon: "M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z",
    title: "Affordable & Transparent",
    desc: "Low deposit, simple monthly pricing, no hidden fees. Professional quality without the agency price tag.",
  },
];
const steps = [
  { num: "01", title: "Discovery Call", desc: "We learn about your business, goals, and brand identity. This is where your vision becomes our blueprint." },
  { num: "02", title: "Design & Build", desc: "We craft your custom site with modern design, fast performance, and every feature you need. 1–3 week turnaround." },
  { num: "03", title: "Launch & Grow", desc: "Your site goes live and we handle hosting, maintenance, and updates. You focus on running your business." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-[var(--sl-navy)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--sl-navy)] via-[var(--sl-navy)] to-[var(--sl-navy)]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--sl-blue)]/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--sl-lime)]/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-4xl px-6 pt-16">
          <p className="text-[var(--sl-lime)] font-medium mb-4 tracking-wide uppercase text-sm">Web Design & Development for Small Businesses</p>
          <h1 className="text-5xl md:text-7xl font-bold text-[var(--sl-ice)] mb-6 tracking-tight leading-tight">
            Your Business Deserves a Website That Works as Hard as You Do
          </h1>
          <p className="text-lg md:text-xl text-[var(--sl-ice)]/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Professional, custom-built websites with the affordability and simplicity of a subscription. Low deposit. Simple monthly pricing. Big impact.
          </p>          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing"
              className="px-8 py-4 bg-[var(--sl-blue)] text-[var(--sl-ice)] rounded-xl font-semibold text-lg hover:bg-[var(--sl-blue)]/80 transition-all hover:scale-105 shadow-lg shadow-[var(--sl-blue)]/25">
              See Our Plans
            </Link>
            <Link href="/services"
              className="px-8 py-4 border border-[var(--sl-ice)]/20 text-[var(--sl-ice)] rounded-xl font-semibold text-lg hover:bg-[var(--sl-ice)]/10 transition-all">
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[var(--sl-ice)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[var(--sl-blue)] font-semibold text-sm uppercase tracking-wider mb-3">Why Snow Leopard Labs</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--sl-navy)]">Everything Your Business Needs Online</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-8 rounded-2xl bg-[var(--sl-ice)] hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-[var(--sl-blue)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--sl-blue)]/20 transition-colors">
                  <svg className="w-6 h-6 text-[var(--sl-blue)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>                <h3 className="text-lg font-bold text-[var(--sl-navy)] mb-3">{f.title}</h3>
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
            <p className="text-[var(--sl-lime)] font-semibold text-sm uppercase tracking-wider mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--sl-ice)]">Three Steps to Your New Website</h2>
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
      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-[var(--sl-blue)] to-[var(--sl-lime)]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--sl-ice)] mb-6">Ready to Stand Out Online?</h2>
          <p className="text-[var(--sl-ice)]/80 text-lg mb-10 max-w-xl mx-auto">
            Join small businesses already growing with Snow Leopard Labs. Get a professional website without the professional price tag.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing"
              className="px-8 py-4 bg-[var(--sl-ice)] text-[var(--sl-navy)] rounded-xl font-bold text-lg hover:bg-[var(--sl-ice)]/90 transition-all hover:scale-105 shadow-lg">
              View Pricing
            </Link>
            <Link href="/contact"
              className="px-8 py-4 border-2 border-[var(--sl-ice)] text-[var(--sl-ice)] rounded-xl font-bold text-lg hover:bg-[var(--sl-ice)]/10 transition-all">
              Book a Call
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}