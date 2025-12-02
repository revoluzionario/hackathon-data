"use client";

import type { CatalogFilters } from "@/types/api";
import type { CatalogMultiFilterKey } from "@/utils/catalog";

interface CatalogActiveFiltersProps {
  filters: CatalogFilters;
  onRemove: (key: CatalogMultiFilterKey | "search" | "minPrice" | "maxPrice", value?: string) => void;
  onClearAll?: () => void;
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
      {label}
      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
        className="rounded-full p-0.5 text-zinc-500 transition hover:text-emerald-600"
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3l6 6" strokeLinecap="round" />
          <path d="M9 3L3 9" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

export function CatalogActiveFilters({ filters, onRemove, onClearAll }: CatalogActiveFiltersProps) {
  const chips: Array<{ key: CatalogMultiFilterKey | "search" | "minPrice" | "maxPrice"; label: string; value?: string }> = [];

  if (filters.search) {
    chips.push({ key: "search", label: `Search: ${filters.search}` });
  }

  (["colors", "sizes", "materials"] as CatalogMultiFilterKey[]).forEach((key) => {
    filters[key].forEach((value) => {
      chips.push({ key, label: `${key.slice(0, -1)}: ${value}`, value });
    });
  });

  if (filters.minPrice != null) {
    chips.push({ key: "minPrice", label: `Min $${filters.minPrice}` });
  }
  if (filters.maxPrice != null) {
    chips.push({ key: "maxPrice", label: `Max $${filters.maxPrice}` });
  }

  if (!chips.length) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-3xl border border-dashed border-zinc-200 bg-white/80 px-4 py-3 text-xs">
      <span className="text-zinc-500">Active filters:</span>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <FilterChip key={`${chip.key}-${chip.value ?? "single"}`} label={chip.label} onRemove={() => onRemove(chip.key, chip.value)} />
        ))}
      </div>
      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold text-emerald-600 transition hover:text-emerald-500"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
