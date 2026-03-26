import Link from "next/link";

const services = [
  {
    title: "Custom Website Design",
    desc: "We design and build every site from scratch — no templates, no cookie-cutter layouts. Your brand identity drives the design, from color palette to typography to layout. Every site is fully responsive and optimized for mobile, tablet, and desktop.",
    icon: "M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42",
  },
  {
    title: "Web Application Development",
    desc: "Need more than a website? We build full-featured web applications — dashboards, portals, booking systems, SaaS tools, and more. Built on modern frameworks for speed, security, and scalability.",
    icon: "M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5",
  },
  {
    title: "CRM & Lead Management",
    desc: "Track leads, manage customer relationships, and automate follow-ups — all built right into your website. No juggling separate tools. See who visited, who contacted you, and where your pipeline stands at a glance.",
    icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  },
  {
    title: "E-Commerce Solutions",
    desc: "Sell products or services directly from your website. We integrate secure payment processing through Stripe and PayPal, build product catalogs, shopping carts, and checkout flows that convert visitors into customers.",
    icon: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z",
  },  {
    title: "SEO & Analytics",
    desc: "Every site comes with foundational SEO — proper meta tags, sitemaps, schema markup, and fast load times. Business tier clients get an advanced analytics dashboard with real-time visitor data and conversion tracking.",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  },
  {
    title: "AI-Powered Tools",
    desc: "Stand out with AI features your competitors don\u2019t have. We integrate smart chatbots for customer inquiries, AI content suggestions for your blog, and an SEO assistant that helps you rank higher — all built into your site.",
    icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z",
  },
  {
    title: "Social Media Integration",
    desc: "Link and embed your social feeds directly on your site. Instagram, Facebook, X, LinkedIn — your visitors see your latest activity and can follow you instantly. Business tier includes a social management hub for scheduling and analytics.",
    icon: "M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z",
  },
];
const techStack = [
  { name: "Next.js", desc: "React framework for fast, SEO-friendly sites" },
  { name: "Tailwind CSS", desc: "Utility-first styling for consistent design" },
  { name: "Vercel", desc: "Edge hosting with global CDN & auto-deploy" },
  { name: "Supabase", desc: "Database, auth, and real-time features" },
  { name: "Stripe", desc: "Secure payment processing" },
  { name: "OpenAI", desc: "AI chatbots and content tools" },
];

export default function Services() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-[var(--sl-navy)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[var(--sl-lime)] font-semibold text-sm uppercase tracking-wider mb-3">What We Build</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--sl-ice)] mb-6">Services That Drive Results</h1>
          <p className="text-[var(--sl-ice)]/60 text-lg max-w-2xl mx-auto">
            From simple brochure sites to full-featured web applications, we build everything your business needs to thrive online.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-[var(--sl-ice)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((s) => (
            <div key={s.title} className="p-8 rounded-2xl border border-[var(--sl-navy)]/10 hover:shadow-lg transition-all hover:border-[var(--sl-blue)]/30 group">
              <div className="w-12 h-12 rounded-xl bg-[var(--sl-blue)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--sl-blue)]/20 transition-colors">
                <svg className="w-6 h-6 text-[var(--sl-blue)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>              <h3 className="text-xl font-bold text-[var(--sl-navy)] mb-3">{s.title}</h3>
              <p className="text-[var(--sl-navy)]/60 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-[var(--sl-ice)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--sl-navy)]">Built on Modern Technology</h2>
            <p className="text-[var(--sl-navy)]/60 mt-3">We use the same tools powering the world&apos;s fastest-growing startups.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {techStack.map((t) => (
              <div key={t.name} className="bg-white p-6 rounded-xl text-center border border-[var(--sl-navy)]/10">
                <h4 className="font-bold text-[var(--sl-navy)] mb-1">{t.name}</h4>
                <p className="text-sm text-[var(--sl-navy)]/60">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[var(--sl-navy)]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--sl-ice)] mb-6">Ready to Build Something Great?</h2>
          <p className="text-[var(--sl-ice)]/80 text-lg mb-10">Let&apos;s talk about what your business needs and how we can make it happen.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing" className="px-8 py-4 bg-[var(--sl-blue)] text-[var(--sl-ice)] rounded-xl font-semibold hover:bg-[var(--sl-blue)]/80 transition-all">View Pricing</Link>
            <Link href="/contact" className="px-8 py-4 border border-[var(--sl-ice)]/20 text-[var(--sl-ice)] rounded-xl font-semibold hover:bg-[var(--sl-ice)]/10 transition-all">Book a Call</Link>
          </div>
        </div>
      </section>
    </>
  );
}