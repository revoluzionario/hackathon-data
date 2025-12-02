"use client";

import Link from "next/link";

interface CatalogEmptyStateProps {
  headline?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function CatalogEmptyState({
  headline = "No products matched",
  description = "Try adjusting your filters or explore our featured collections.",
  ctaLabel = "View all products",
  ctaHref = "/products",
}: CatalogEmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-zinc-200 bg-white/80 px-8 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="7" />
          <path d="M15 15l4 4" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-zinc-900">{headline}</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-500">{description}</p>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex items-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
