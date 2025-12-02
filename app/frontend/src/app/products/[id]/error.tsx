"use client";

import { useEffect } from "react";

interface ProductErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductError({ error, reset }: ProductErrorProps) {
  useEffect(() => {
    console.error("Product page error", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="space-y-6 rounded-3xl border border-rose-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Something went wrong</p>
        <h1 className="text-3xl font-semibold text-zinc-900">We could not load this product.</h1>
        <p className="text-base text-zinc-600">
          Please refresh the page or try again. If the problem persists, our team will investigate.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-500"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
