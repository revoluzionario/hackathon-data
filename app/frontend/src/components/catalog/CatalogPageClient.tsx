"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { CatalogFilterOptions, CatalogFilters, DisplayProduct, ProductListMeta } from "@/types/api";
import { CatalogActiveFilters } from "@/components/catalog/CatalogActiveFilters";
import { CatalogFiltersPanel } from "@/components/catalog/CatalogFiltersPanel";
import { CatalogTopBar } from "@/components/catalog/CatalogTopBar";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { CatalogProductGrid } from "@/components/catalog/CatalogProductGrid";
import { CatalogEmptyState } from "@/components/catalog/CatalogEmptyState";
import { useCatalogFilters } from "@/hooks/useCatalogFilters";
import { useCatalogAnalytics } from "@/hooks/useCatalogAnalytics";
import { CatalogMultiFilterKey, hasActiveCatalogFilters } from "@/utils/catalog";

interface CatalogPageClientProps {
  initialFilters: CatalogFilters;
  products: DisplayProduct[];
  meta: ProductListMeta;
  filterOptions: CatalogFilterOptions;
  title?: string;
  description?: string;
  categoryName?: string;
  pageId: string;
}

export function CatalogPageClient({
  initialFilters,
  products,
  meta,
  filterOptions,
  title,
  description,
  categoryName,
  pageId,
}: CatalogPageClientProps) {
  const [isMobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const {
    filters,
    updateFilter,
    updateFilters,
    toggleValue,
    setPage,
    resetFilters,
  } = useCatalogFilters({ initialFilters, categoryId: initialFilters.categoryId, defaultLimit: initialFilters.limit });

  const { trackFilterChange, trackSortChange, trackPagination, trackProductImpression, trackProductClick } =
    useCatalogAnalytics({ pageId, categoryId: initialFilters.categoryId, filters });

  const pageTitle = title ?? (categoryName ? `${categoryName} catalog` : "All products");
  const pageDescription = description ??
    (categoryName
      ? `Browse ${categoryName} picks filtered by Fabric intelligence.`
      : "Browse the entire catalog with AI-ready filters and merchandising.");

  const hasFilters = hasActiveCatalogFilters(filters);
  const productOffset = useMemo(() => (filters.page - 1) * filters.limit, [filters.limit, filters.page]);
  const filtersPanelKey = useMemo(
    () =>
      [
        filters.search,
        filters.minPrice ?? "",
        filters.maxPrice ?? "",
        filters.colors.join(","),
        filters.sizes.join(","),
        filters.materials.join(","),
      ].join("|"),
    [filters.colors, filters.materials, filters.maxPrice, filters.minPrice, filters.search, filters.sizes],
  );

  useEffect(() => {
    products.forEach((product, index) => {
      trackProductImpression(product.id, productOffset + index + 1);
    });
  }, [products, productOffset, trackProductImpression]);

  const handleSortChange = (value: CatalogFilters["sort"]) => {
    trackSortChange(value);
    updateFilter("sort", value);
  };

  const handleToggle = (key: CatalogMultiFilterKey, value: string) => {
    trackFilterChange(key, value);
    toggleValue(key, value);
  };

  const handleUpdateFilters = (updates: Partial<CatalogFilters>) => {
    const keyList = Object.keys(updates).join(",") || "batch";
    trackFilterChange(keyList, updates);
    updateFilters(updates);
  };

  const handleRemoveFilter = (key: CatalogMultiFilterKey | "search" | "minPrice" | "maxPrice", value?: string) => {
    switch (key) {
      case "search":
        handleUpdateFilters({ search: "" });
        break;
      case "minPrice":
        handleUpdateFilters({ minPrice: undefined });
        break;
      case "maxPrice":
        handleUpdateFilters({ maxPrice: undefined });
        break;
      default:
        if (value) {
          handleToggle(key, value);
        }
        break;
    }
  };

  const handlePagination = (page: number) => {
    trackPagination(page);
    setPage(page);
  };

  const handleProductClick = (productId: number, position: number) => {
    trackProductClick(productId, position);
  };

  const handleResetFilters = () => {
    trackFilterChange("reset", null);
    resetFilters();
  };

  const showEmptyState = products.length === 0;

  return (
    <Fragment>
      <CatalogTopBar
        filters={filters}
        total={meta.total}
        onSortChange={handleSortChange}
        onOpenFilters={() => setMobileFiltersOpen(true)}
        title={pageTitle}
        description={pageDescription}
      />

      {hasFilters && (
        <CatalogActiveFilters filters={filters} onRemove={handleRemoveFilter} onClearAll={handleResetFilters} />
      )}

      <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
        <div className="hidden lg:block">
          <CatalogFiltersPanel
            key={`desktop-${filtersPanelKey}`}
            filters={filters}
            options={filterOptions}
            onUpdate={handleUpdateFilters}
            onToggle={handleToggle}
            onReset={handleResetFilters}
            variant="desktop"
          />
        </div>
        <div className="flex flex-col gap-8">
          {showEmptyState ? (
            <CatalogEmptyState />
          ) : (
            <CatalogProductGrid
              products={products}
              offset={productOffset}
              onProductClick={handleProductClick}
              analyticsLocation="catalog"
            />
          )}
          <CatalogPagination meta={meta} onPageChange={handlePagination} />
        </div>
      </div>

      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 lg:hidden">
          <div className="flex h-full flex-col rounded-3xl bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900">Filters</p>
              <button
                type="button"
                className="rounded-full border border-zinc-200 p-2 text-zinc-600"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4l8 8" strokeLinecap="round" />
                  <path d="M12 4L4 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CatalogFiltersPanel
                key={`mobile-${filtersPanelKey}`}
                filters={filters}
                options={filterOptions}
                onUpdate={(updates) => {
                  handleUpdateFilters(updates);
                }}
                onToggle={handleToggle}
                onReset={handleResetFilters}
                variant="mobile"
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-4 rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Fragment>
  );
}
