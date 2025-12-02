"use client";

import { useMemo, useState } from "react";
import type { CatalogFilterOptions, CatalogFilters } from "@/types/api";
import { CatalogMultiFilterKey, formatPriceLabel } from "@/utils/catalog";

interface CatalogFiltersPanelProps {
  filters: CatalogFilters;
  options: CatalogFilterOptions;
  onUpdate: (updates: Partial<CatalogFilters>) => void;
  onToggle: (key: CatalogMultiFilterKey, value: string) => void;
  onReset: () => void;
  variant?: "desktop" | "mobile";
}

const FILTER_LABELS: Record<CatalogMultiFilterKey, string> = {
  colors: "Colors",
  sizes: "Sizes",
  materials: "Materials",
};

export function CatalogFiltersPanel({
  filters,
  options,
  onUpdate,
  onToggle,
  onReset,
  variant = "desktop",
}: CatalogFiltersPanelProps) {
  const [searchValue, setSearchValue] = useState(filters.search);
  const [minPrice, setMinPrice] = useState<string>(filters.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState<string>(filters.maxPrice?.toString() ?? "");

  const panelClasses = useMemo(() => {
    const base = "flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm";
    if (variant === "mobile") {
      return `${base} w-full`;
    }
    return `${base} w-full lg:sticky lg:top-6`;
  }, [variant]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onUpdate({ search: searchValue.trim() });
  };

  const handlePriceBlur = () => {
    const nextMin = minPrice ? Number(minPrice) : undefined;
    const nextMax = maxPrice ? Number(maxPrice) : undefined;
    onUpdate({ minPrice: nextMin, maxPrice: nextMax });
  };

  return (
    <aside className={panelClasses} aria-label="Catalog filters">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-emerald-600 transition hover:text-emerald-500"
        >
          Reset
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="catalog-search-input">
          Search
        </label>
        <div className="flex rounded-full border border-zinc-200 bg-white pr-1 shadow-sm focus-within:border-emerald-500">
          <input
            id="catalog-search-input"
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="AI-ready tote, ONNX sneaker..."
            className="flex-1 rounded-full px-4 py-2 text-sm text-zinc-900 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Apply
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-zinc-600">
          <span>Price range</span>
          {options.priceRange && (
            <span>
              {formatPriceLabel(options.priceRange.min)} – {formatPriceLabel(options.priceRange.max)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="catalog-min-price" className="sr-only">
              Minimum price
            </label>
            <input
              id="catalog-min-price"
              type="number"
              inputMode="decimal"
              min={0}
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              onBlur={handlePriceBlur}
              placeholder="Min"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="catalog-max-price" className="sr-only">
              Maximum price
            </label>
            <input
              id="catalog-max-price"
              type="number"
              inputMode="decimal"
              min={0}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              onBlur={handlePriceBlur}
              placeholder="Max"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {(["colors", "sizes", "materials"] as CatalogMultiFilterKey[]).map((key) => {
        const values = options[key];
        if (!values.length) {
          return null;
        }
        return (
          <div key={key} className="border-t border-zinc-100 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-800">{FILTER_LABELS[key]}</p>
              <span className="text-xs text-zinc-400">{values.length} options</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const isActive = filters[key].includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onToggle(key, value)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      isActive
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
