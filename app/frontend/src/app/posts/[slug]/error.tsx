"use client";

import Link from "next/link";

interface PostErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PostError({ error, reset }: PostErrorProps) {
  console.error("Post detail error", error);

  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="space-y-6 rounded-3xl border border-rose-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-600">Something went wrong</p>
        <h1 className="text-3xl font-semibold text-zinc-900">We couldn’t load this story.</h1>
        <p className="text-base text-zinc-600">Please refresh the page or return to the blog overview.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-500"
          >
            Try again
          </button>
          <Link
            href="/posts"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-6 py-3 text-base font-semibold text-zinc-900 transition hover:border-emerald-500 hover:text-emerald-600"
          >
            Back to blog
          </Link>
        </div>
      </div>
    </main>
  );
}
