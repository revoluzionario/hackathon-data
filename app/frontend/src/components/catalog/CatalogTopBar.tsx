"use client";

import { useMemo } from "react";
import type { CatalogFilters, CatalogSort } from "@/types/api";

const DEFAULT_SORT_OPTIONS: Array<{ label: string; value: CatalogSort }> = [
  { label: "Featured", value: "popularity" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
];

interface CatalogTopBarProps {
  filters: CatalogFilters;
  total: number;
  sortOptions?: Array<{ label: string; value: CatalogSort }>;
  onSortChange: (value: CatalogSort) => void;
  onOpenFilters?: () => void;
  title?: string;
  description?: string;
}

export function CatalogTopBar({
  filters,
  total,
  sortOptions = DEFAULT_SORT_OPTIONS,
  onSortChange,
  onOpenFilters,
  title = "Product catalog",
  description = "Curated by analytics, powered by Fabric.",
}: CatalogTopBarProps) {
  const rangeLabel = useMemo(() => {
    if (!total) {
      return "Showing 0 results";
    }
    const start = (filters.page - 1) * filters.limit + 1;
    const end = Math.min(total, filters.page * filters.limit);
    return `Showing ${start}–${end} of ${total}`;
  }, [filters.limit, filters.page, total]);

  return (
    <section className="mb-6 flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Live catalog</p>
            <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
          </div>
          {onOpenFilters && (
            <button
              type="button"
              onClick={onOpenFilters}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-600 lg:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 3h12" strokeLinecap="round" />
                <path d="M4 8h8" strokeLinecap="round" />
                <path d="M6 13h4" strokeLinecap="round" />
              </svg>
              Filters
            </button>
          )}
        </div>
        <p className="text-sm text-zinc-600">{description}</p>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-zinc-500">{rangeLabel}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            Sort by
            <span className="relative">
              <select
                className="appearance-none rounded-full border border-zinc-200 bg-white px-4 py-2 pr-8 text-sm font-medium text-zinc-800 shadow-sm focus:border-emerald-500 focus:outline-none"
                value={filters.sort}
                onChange={(event) => onSortChange(event.target.value as CatalogSort)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
