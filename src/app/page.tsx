export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-snow-dark)] text-white">
      <div className="text-center max-w-3xl px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Snow Leopard
        </h1>
        <p className="text-xl md:text-2xl text-[var(--color-snow-accent2)] mb-4">
          Professional Web Design for Small Businesses
        </p>
        <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
          Custom websites that make a big, clean, professional impact.
          Low deposit. Simple monthly subscription. No compromises.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#"
            className="px-8 py-3 bg-[var(--color-snow-accent)] text-white rounded-lg font-semibold hover:bg-[var(--color-snow-accent)]/90 transition-colors"
          >
            See Our Plans
          </a>
          <a
            href="#"
            className="px-8 py-3 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
          >
            View Our Work
          </a>
        </div>
      </div>
      <footer className="absolute bottom-8 text-white/30 text-sm">
        &copy; {new Date().getFullYear()} Snow Leopard LLC. All rights reserved.
      </footer>
    </main>
  );
}
