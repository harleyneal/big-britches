import Link from "next/link";

export default function ServicesPage() {
  const services = [
    {
      id: 1,
      title: "Custom Website Design",
      description:
        "Every site is built from scratch to match your brand — no templates, no cookie-cutter layouts. Fully responsive across mobile, tablet, and desktop with lightning-fast performance.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
          />
        </svg>
      ),
    },
    {
      id: 2,
      title: "Admin Dashboard",
      description:
        "Your own private dashboard to manage your entire business online. Track appointments, view revenue, manage orders, and customize your site — all from one clean, simple interface.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
          />
        </svg>
      ),
    },
    {
      id: 3,
      title: "Online Scheduling & Booking",
      description:
        "Let your customers book appointments directly from your website. Manage your calendar, set availability, send confirmations and reminders — no third-party scheduling tools needed.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
      ),
    },
    {
      id: 4,
      title: "Payments & Invoicing",
      description:
        "Accept payments and send invoices directly through your site, powered by Stripe. Track revenue, view transaction history, and manage payouts — all from your dashboard.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
          />
        </svg>
      ),
    },
    {
      id: 5,
      title: "Order & Job Tracking",
      description:
        "Track services and orders from start to finish. A simple, clean workflow — New, In Progress, Complete, Paid — so you always know where every job stands.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
          />
        </svg>
      ),
    },
    {
      id: 6,
      title: "AI-Powered Tools",
      description:
        "Stand out with AI features your competitors don't have. A smart chatbot handles customer inquiries 24/7, plus content suggestions and an SEO assistant to help you rank higher.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
          />
        </svg>
      ),
    },
  ];

  const techStack = [
    {
      name: "Next.js",
      description: "React framework for fast, SEO-friendly sites",
    },
    {
      name: "Tailwind CSS",
      description: "Utility-first styling for clean, consistent design",
    },
    {
      name: "Vercel",
      description: "Edge hosting with global CDN & auto-deploy",
    },
    {
      name: "Supabase",
      description: "Database, auth, and real-time features",
    },
    {
      name: "Stripe",
      description: "Secure payment processing & invoicing",
    },
    {
      name: "Claude AI",
      description: "Intelligent chatbots and content tools",
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--sl-navy)" }}>
      {/* Header */}
      <section className="px-6 py-20 md:py-28 text-center">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--sl-ice)" }}
          >
            The Platform
          </p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            style={{ color: "var(--sl-ice)" }}
          >
            Everything Your Business Needs In One Place
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--sl-lime)" }}
          >
            A custom website, admin dashboard, scheduling, payments, and AI tools — all built,
            hosted, and maintained by Snow Leopard Labs.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="p-8 rounded-lg border transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: "var(--sl-navy)",
                borderColor: "var(--sl-blue)",
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                style={{ color: "var(--sl-lime)", backgroundColor: "var(--sl-blue)" }}
              >
                {service.icon}
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: "var(--sl-ice)" }}
              >
                {service.title}
              </h3>
              <p style={{ color: "var(--sl-blue)" }} className="leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-6 py-20" style={{ backgroundColor: "var(--sl-blue)" }}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: "var(--sl-navy)" }}
          >
            Built With Modern Technology
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techStack.map((tech) => (
              <div key={tech.name} className="text-center">
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--sl-navy)" }}
                >
                  {tech.name}
                </h3>
                <p style={{ color: "var(--sl-navy)" }} className="opacity-90">
                  {tech.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 md:py-28 text-center">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: "var(--sl-ice)" }}
          >
            Ready to Simplify Your Business?
          </h2>
          <p
            className="text-lg mb-10 leading-relaxed"
            style={{ color: "var(--sl-lime)" }}
          >
            Let's talk about what your business needs and build the perfect setup for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:opacity-90"
              style={{
                backgroundColor: "var(--sl-lime)",
                color: "var(--sl-navy)",
              }}
            >
              View Pricing
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 rounded-lg font-semibold border-2 transition-all duration-300 hover:opacity-90"
              style={{
                borderColor: "var(--sl-lime)",
                color: "var(--sl-lime)",
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}