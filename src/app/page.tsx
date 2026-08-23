export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-surface px-6 py-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-dark sm:text-5xl">
          Rescue 8 Philippines
        </h1>
        <p className="mt-4 text-lg leading-7 text-muted">
          Premium products and solutions for every Filipino. Shop with confidence.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-brand-blue px-8 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Shop Products
          </a>
          <a
            href="/about"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-white px-8 text-sm font-semibold text-dark transition-colors hover:bg-surface"
          >
            Learn More
          </a>
        </div>
      </div>
    </main>
  );
}