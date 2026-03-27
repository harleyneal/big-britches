import Link from "next/link";

const values = [
  { title: "No Shortcuts", desc: "We don't do templates. Every project gets built from scratch because your business deserves better than a theme with your logo slapped on it." },
  { title: "Straight Talk", desc: "Simple pricing, honest timelines, zero surprises. If something's going to take longer, we'll tell you. Wild concept, we know." },
  { title: "Long Haul", desc: "We're not here to build your site and vanish. We stick around, keep things running, and grow with you. Think of us as your tech team, minus the ping pong table." },
  { title: "Punching Above Your Weight", desc: "AI, automation, analytics — tools that used to cost a fortune. We bake them into every plan because small businesses deserve big-business tools." },
];

export default function About() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-[var(--sl-navy)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[var(--sl-lime)] font-semibold text-sm uppercase tracking-wider mb-3">Our Story</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--sl-ice)] mb-6">We Think Small Businesses Deserve Better</h1>
          <p className="text-[var(--sl-ice)]/60 text-lg max-w-2xl mx-auto">
            Big Britches was born out of a simple frustration: why does getting a decent website have to be so expensive, so complicated, or so... ugly?
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-[var(--sl-ice)]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[var(--sl-navy)] mb-6">Here&apos;s the Thing</h2>
              <p className="text-[var(--sl-navy)]/60 leading-relaxed mb-4">
                Small businesses are the backbone of every community. The local bakery, the neighborhood gym, the plumber who actually shows up on time — these are the people who make towns worth living in.
              </p>
              <p className="text-[var(--sl-navy)]/60 leading-relaxed mb-4">
                But in today&apos;s world, if you&apos;re not online, you might as well be invisible. And the options? Overpriced agencies, cookie-cutter builders, or your nephew who &quot;knows WordPress.&quot; None of that cuts it.
              </p>
              <p className="text-[var(--sl-navy)]/60 leading-relaxed">
                So we built Big Britches — agency-quality websites and real business tools, all wrapped up in a subscription that won&apos;t require a second mortgage. Because looking professional online shouldn&apos;t be a luxury.
              </p>
            </div>
            <div className="bg-[var(--sl-ice)] rounded-2xl p-10 text-center">
              <div className="text-6xl font-black text-[var(--sl-blue)]/20 mb-2">BB</div>
              <p className="text-[var(--sl-navy)] font-bold text-lg">Big Britches LLC</p>
              <p className="text-[var(--sl-navy)]/50 text-sm mt-1">Websites & Tools for Small Business</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[var(--sl-ice)]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[var(--sl-navy)] text-center mb-12">What We&apos;re About</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v) => (
              <div key={v.title} className="bg-[var(--sl-ice)] p-8 rounded-2xl border border-[var(--sl-navy)]/10">
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
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--sl-ice)] mb-6">Let&apos;s Build Something You&apos;re Proud Of</h2>
          <p className="text-[var(--sl-ice)]/80 text-lg mb-10">Tell us about your business. We&apos;ll tell you how we can help. No pressure, no nonsense.</p>
          <Link href="/contact" className="inline-block px-8 py-4 bg-[var(--sl-blue)] text-[var(--sl-ice)] rounded-full font-semibold text-lg hover:brightness-110 hover:scale-[1.04] hover:shadow-lg hover:shadow-[var(--sl-blue)]/20 active:scale-[0.98] transition-all duration-200">
            Get In Touch
          </Link>
        </div>
      </section>
    </>
  );
}
