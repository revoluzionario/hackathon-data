import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="space-y-6 rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Missing product</p>
        <h1 className="text-3xl font-semibold text-zinc-900">We could not find that item.</h1>
        <p className="text-base text-zinc-600">
          It may have sold out or been moved. Explore our latest collection to find something you love.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-500"
        >
          Browse products
        </Link>
      </div>
    </main>
  );
}
