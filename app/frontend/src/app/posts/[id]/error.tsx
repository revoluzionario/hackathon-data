"use client";

import { useEffect } from "react";

export default function ErrorPage({ error }: { error: Error }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-xl font-semibold">Unable to load post</h2>
      <p className="mt-2 text-sm text-zinc-600">This post might not exist or there was a network error.</p>
    </div>
  );
}
