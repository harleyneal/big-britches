"use client";
import { useState, useRef, useCallback } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, business, message }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or email us directly at team@bigbritches.io.");
    } finally {
      setSending(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-[var(--sl-navy)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[var(--sl-lime)] font-semibold text-sm uppercase tracking-wider mb-3">Get In Touch</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--sl-ice)] mb-6">Let&apos;s Chat About Your Business</h1>
          <p className="text-[var(--sl-ice)]/60 text-lg max-w-2xl mx-auto">
            Got questions? Got ideas? Got a business that deserves a better website? Drop us a line and we&apos;ll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 bg-[var(--sl-ice)]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <div>
            {submitted ? (
              <div className="bg-[var(--sl-navy)] rounded-2xl p-10 text-center">
                <svg className="w-16 h-16 text-[var(--sl-lime)] mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <h3 className="text-2xl font-bold text-[var(--sl-ice)] mb-3">Your Britches Are About to Get Bigger.</h3>
                <p className="text-[var(--sl-ice)]/60 mb-8">Place your deposit to get things moving.</p>
                <button
                  className="w-full px-6 py-4 bg-[var(--sl-lime)] text-[var(--sl-navy)] rounded-full font-bold text-lg hover:brightness-110 hover:scale-[1.03] hover:shadow-lg hover:shadow-[var(--sl-lime)]/20 active:scale-[0.98] transition-all duration-200 mb-4"
                  onClick={() => {/* Stripe checkout will go here */}}
                >
                  Place $300 Deposit
                </button>
                <p className="text-[var(--sl-ice)]/40 text-xs">Secure payment powered by Stripe</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">Name</label>
                    <input type="text" required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border border-[var(--sl-navy)]/15 focus:border-[var(--sl-blue)] focus:ring-2 focus:ring-[var(--sl-blue)]/20 outline-none transition-all text-base" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">Email</label>
                    <input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border border-[var(--sl-navy)]/15 focus:border-[var(--sl-blue)] focus:ring-2 focus:ring-[var(--sl-blue)]/20 outline-none transition-all text-base" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">Business Name</label>
                  <input type="text" placeholder="Your business name" value={business} onChange={(e) => setBusiness(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border border-[var(--sl-navy)]/15 focus:border-[var(--sl-blue)] focus:ring-2 focus:ring-[var(--sl-blue)]/20 outline-none transition-all text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">Tell us about your project</label>
                  <textarea rows={10} required placeholder="What does your business do? What type of look and feel are you going for your site? How do you want this site to work for you? The more details the better, so we can put together something that helps you succeed." value={message} onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border border-[var(--sl-navy)]/15 focus:border-[var(--sl-blue)] focus:ring-2 focus:ring-[var(--sl-blue)]/20 outline-none transition-all resize-y text-base min-h-[200px]" />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-[var(--sl-navy)] mb-2">Attachments <span className="text-[var(--sl-navy)]/40 font-normal">(optional)</span></label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 px-5 py-8 text-center ${
                      dragActive
                        ? "border-[var(--sl-blue)] bg-[var(--sl-blue)]/5"
                        : "border-[var(--sl-navy)]/15 hover:border-[var(--sl-blue)]/50 hover:bg-[var(--sl-blue)]/[0.02]"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <svg className="w-8 h-8 text-[var(--sl-navy)]/30 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-sm text-[var(--sl-navy)]/50">
                      <span className="font-semibold text-[var(--sl-blue)]">Click to upload</span> or drag and drop files here
                    </p>
                    <p className="text-xs text-[var(--sl-navy)]/30 mt-1">Logos, screenshots, inspiration, documents — anything that helps us understand your vision</p>
                  </div>

                  {/* File list */}
                  {files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-[var(--sl-navy)]/[0.03] rounded-lg px-4 py-2.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <svg className="w-4 h-4 text-[var(--sl-blue)] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                            </svg>
                            <span className="text-sm text-[var(--sl-navy)] truncate">{file.name}</span>
                            <span className="text-xs text-[var(--sl-navy)]/40 shrink-0">{formatFileSize(file.size)}</span>
                          </div>
                          <button type="button" onClick={() => removeFile(index)} className="text-[var(--sl-navy)]/30 hover:text-red-500 transition-colors ml-3 shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <button type="submit" disabled={sending}
                  className="w-full px-6 py-4 bg-[var(--sl-blue)] text-[var(--sl-ice)] rounded-full font-bold text-lg hover:brightness-110 hover:scale-[1.03] hover:shadow-lg hover:shadow-[var(--sl-blue)]/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                  {sending ? "Sending..." : "Send It"}
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
                    <p className="text-[var(--sl-navy)]/60">team@bigbritches.io</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-[var(--sl-ice)] rounded-2xl p-8">
              <h3 className="font-bold text-[var(--sl-navy)] mb-3">What happens after you hit send?</h3>
              <ol className="space-y-3 text-sm text-[var(--sl-navy)]/60">
                <li className="flex gap-3"><span className="font-bold text-[var(--sl-blue)]">1.</span> We read your message (like, actually read it)</li>
                <li className="flex gap-3"><span className="font-bold text-[var(--sl-blue)]">2.</span> We put together a website layout for you to look over</li>
                <li className="flex gap-3"><span className="font-bold text-[var(--sl-blue)]">3.</span> You say the word and we start building</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
