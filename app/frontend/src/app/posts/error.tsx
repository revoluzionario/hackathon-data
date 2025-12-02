"use client";

import { useEffect } from "react";

export default function ErrorPage({ error }: { error: Error }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-zinc-600">Unable to load blog posts. Try again later.</p>
    </div>
  );
}
"use client";

interface PostsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PostsError({ error, reset }: PostsErrorProps) {
  console.error("Posts page error", error);

  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="space-y-6 rounded-3xl border border-rose-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-600">Something went wrong</p>
        <h1 className="text-3xl font-semibold text-zinc-900">We could not load the blog right now.</h1>
        <p className="text-base text-zinc-600">Please refresh the page or try again in a few minutes.</p>
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
