import Link from "next/link";

const values = [
  { title: "Quality Over Quantity", desc: "We don\u2019t churn out template sites. Every project gets the attention and craft it deserves." },
  { title: "Transparency", desc: "Simple pricing, honest timelines, no hidden fees. You always know exactly what you\u2019re getting." },
  { title: "Partnership", desc: "We\u2019re not a vendor — we\u2019re your long-term partner in growing your online presence." },
  { title: "Innovation", desc: "We leverage AI and modern technology to give small businesses tools that used to be reserved for enterprises." },
];

export default function About() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-[var(--sl-navy)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[var(--sl-lime)] font-semibold text-sm uppercase tracking-wider mb-3">Our Story</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Built for the Businesses That Build Communities</h1>
          <p className="text-[var(--sl-ice)]/60 text-lg max-w-2xl mx-auto">
            Snow Leopard Labs LLC was founded on a simple belief: every small business deserves a professional online presence, regardless of budget.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[var(--sl-navy)] mb-6">Why We Exist</h2>              <p className="text-[var(--sl-navy)]/60 leading-relaxed mb-4">
                Small businesses are the backbone of every community. But in today&apos;s digital-first world, too many of them are invisible online — stuck with outdated websites, overpriced agencies, or DIY builders that look generic.
              </p>
              <p className="text-[var(--sl-navy)]/60 leading-relaxed mb-4">
                We started Snow Leopard Labs to change that. We combine agency-quality design with subscription-friendly pricing, so the local coffee shop gets the same caliber website as a funded startup.
              </p>
              <p className="text-[var(--sl-navy)]/60 leading-relaxed">
                And we don&apos;t just build websites — we build platforms. CRM, e-commerce, social media, AI tools, analytics. Everything a small business needs to compete and grow, all in one place.
              </p>
            </div>
            <div className="bg-[var(--sl-ice)] rounded-2xl p-10 text-center">
              <div className="text-6xl font-black text-[var(--sl-blue)]/20 mb-2">SL</div>
              <p className="text-[var(--sl-navy)] font-bold text-lg">Snow Leopard Labs LLC</p>
              <p className="text-[var(--sl-navy)]/50 text-sm mt-1">Web Design & Development</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[var(--sl-ice)]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[var(--sl-navy)] text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v) => (
              <div key={v.title} className="bg-white p-8 rounded-2xl border border-gray-100">
                <h3 className="text-xl font-bold text-[var(--sl-navy)] mb-3">{v.title}</h3>
                <p className="text-[var(--sl-navy)]/60 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="py-20 bg-[var(--sl-navy)]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Let&apos;s Build Something Together</h2>
          <p className="text-[var(--sl-ice)]/60 text-lg mb-10">We&apos;d love to hear about your business and how we can help you grow online.</p>
          <Link href="/contact" className="inline-block px-8 py-4 bg-[var(--sl-blue)] text-white rounded-xl font-semibold text-lg hover:bg-[var(--sl-blue)]/80 transition-all hover:scale-105 shadow-lg shadow-[var(--sl-blue)]/25">
            Get In Touch
          </Link>
        </div>
      </section>
    </>
  );
}