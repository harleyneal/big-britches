"use client";
import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-[var(--sl-navy)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[var(--sl-lime)] font-semibold text-sm uppercase tracking-wider mb-3">Get In Touch</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--sl-ice)] mb-6">Let&apos;s Talk About Your Project</h1>
          <p className="text-[var(--sl-ice)]/60 text-lg max-w-2xl mx-auto">
            Ready to get started? Have questions? Fill out the form below and we&apos;ll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 bg-[var(--sl-ice)]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <div>
            {submitted ? (
              <div className="bg-[var(--sl-lime)]/10 border border-[var(--sl-lime)]/30 rounded-2xl p-10 text-center">                <svg className="w-16 h-16 text-[var(--sl-lime)] mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <h3 className="text-2xl font-bold text-[var(--sl-navy)] mb-2">Message Sent!</h3>
                <p className="text-[var(--sl-navy)]/60">Thanks for reaching out. We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">Name</label>
                    <input type="text" required placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--sl-navy)]/15 focus:border-[var(--sl-blue)] focus:ring-2 focus:ring-[var(--sl-blue)]/20 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">Email</label>
                    <input type="email" required placeholder="you@company.com"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--sl-navy)]/15 focus:border-[var(--sl-blue)] focus:ring-2 focus:ring-[var(--sl-blue)]/20 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">Business Name</label>
                  <input type="text" placeholder="Your business name"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--sl-navy)]/15 focus:border-[var(--sl-blue)] focus:ring-2 focus:ring-[var(--sl-blue)]/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">Which plan are you interested in?</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-[var(--sl-navy)]/15 focus:border-[var(--sl-blue)] focus:ring-2 focus:ring-[var(--sl-blue)]/20 outline-none transition-all bg-[var(--sl-ice)]">
                    <option value="">Select a plan...</option>
                    <option value="starter">Starter ($29/mo)</option>
                    <option value="business">Business ($79–$99/mo)</option>
                    <option value="not-sure">Not sure yet</option>
                  </select>
                </div>                <div>
                  <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">Tell us about your project</label>
                  <textarea rows={5} required placeholder="What does your business do? What are you looking for in a website?"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--sl-navy)]/15 focus:border-[var(--sl-blue)] focus:ring-2 focus:ring-[var(--sl-blue)]/20 outline-none transition-all resize-none" />
                </div>
                <button type="submit"
                  className="w-full px-6 py-4 bg-[var(--sl-blue)] text-[var(--sl-ice)] rounded-xl font-bold text-lg hover:bg-[var(--sl-blue)]/80 transition-all hover:scale-[1.02] shadow-lg shadow-[var(--sl-blue)]/25">
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[var(--sl-navy)] mb-6">Other Ways to Reach Us</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--sl-blue)]/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[var(--sl-blue)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--sl-navy)]">Email</h4>
                    <p className="text-[var(--sl-navy)]/60">info@snowleopardllc.io</p>
                  </div>
                </div>                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--sl-blue)]/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[var(--sl-blue)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--sl-navy)]">Website</h4>
                    <p className="text-[var(--sl-navy)]/60">www.snowleopardllc.io</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--sl-ice)] rounded-2xl p-8">
              <h3 className="font-bold text-[var(--sl-navy)] mb-3">What happens next?</h3>
              <ol className="space-y-3 text-sm text-[var(--sl-navy)]/60">
                <li className="flex gap-3"><span className="font-bold text-[var(--sl-blue)]">1.</span> We review your message and respond within 24 hours</li>
                <li className="flex gap-3"><span className="font-bold text-[var(--sl-blue)]">2.</span> We schedule a free discovery call to learn about your business</li>
                <li className="flex gap-3"><span className="font-bold text-[var(--sl-blue)]">3.</span> We present a custom proposal tailored to your needs</li>
                <li className="flex gap-3"><span className="font-bold text-[var(--sl-blue)]">4.</span> Once approved, we start building your site immediately</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}