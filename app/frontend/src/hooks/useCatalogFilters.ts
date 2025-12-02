"use client";

import { useCallback, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CatalogFilters } from "@/types/api";
import {
  CatalogMultiFilterKey,
  DEFAULT_CATALOG_FILTERS,
  catalogFiltersToSearchParams,
  normalizeCatalogFilters,
  normalizeListValue,
  parseCatalogFilters,
} from "@/utils/catalog";

interface UseCatalogFiltersOptions {
  initialFilters?: CatalogFilters;
  categoryId?: number;
  defaultLimit?: number;
  pathname?: string;
}

interface UpdateOptions {
  preservePage?: boolean;
}

export interface UseCatalogFiltersResult {
  filters: CatalogFilters;
  isPending: boolean;
  updateFilter: <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K], options?: UpdateOptions) => void;
  updateFilters: (updates: Partial<CatalogFilters>, options?: UpdateOptions) => void;
  toggleValue: (key: CatalogMultiFilterKey, value: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  buildHref: (updates?: Partial<CatalogFilters>) => string;
}

export function useCatalogFilters(options: UseCatalogFiltersOptions = {}): UseCatalogFiltersResult {
  const { initialFilters, categoryId, defaultLimit, pathname: providedPathname } = options;
  const router = useRouter();
  const routePathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const pathname = providedPathname ?? routePathname;

  const searchRecord = useMemo<Record<string, string | string[]>>(() => {
    if (!searchParams) return {};
    const record: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }, [searchParams]);

  const parsedFilters = useMemo(
    () => parseCatalogFilters(searchRecord, { defaultLimit, categoryId }),
    [searchRecord, defaultLimit, categoryId],
  );

  const filters = initialFilters ?? parsedFilters;

  const pushFilters = useCallback(
    (next: CatalogFilters) => {
      const params = catalogFiltersToSearchParams(next);
      const query = params.toString();
      const nextUrl = query ? `${pathname}?${query}` : pathname;
      startTransition(() => {
        router.push(nextUrl, { scroll: false });
      });
    },
    [pathname, router],
  );

  const applyUpdates = useCallback(
    (updates: Partial<CatalogFilters>, updateOptions?: UpdateOptions) => {
      const base = normalizeCatalogFilters(
        { ...filters, ...updates },
        { categoryId: filters.categoryId, limit: filters.limit },
      );
      const shouldPreservePage = updateOptions?.preservePage || Object.prototype.hasOwnProperty.call(updates, "page");
      const next = shouldPreservePage ? base : { ...base, page: DEFAULT_CATALOG_FILTERS.page };
      pushFilters(next);
    },
    [filters, pushFilters],
  );

  const updateFilters = useCallback(
    (updates: Partial<CatalogFilters>, updateOptions?: UpdateOptions) => {
      applyUpdates(updates, updateOptions);
    },
    [applyUpdates],
  );

  const updateFilter = useCallback(
    <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K], updateOptions?: UpdateOptions) => {
      updateFilters({ [key]: value } as Partial<CatalogFilters>, updateOptions);
    },
    [updateFilters],
  );

  const toggleValue = useCallback(
    (key: CatalogMultiFilterKey, rawValue: string) => {
      const value = normalizeListValue(rawValue);
      const existing = filters[key];
      const nextValues = existing.includes(value)
        ? existing.filter((entry) => entry !== value)
        : [...existing, value];
      updateFilters({ [key]: nextValues } as Partial<CatalogFilters>);
    },
    [filters, updateFilters],
  );

  const setPage = useCallback(
    (page: number) => {
      const safePage = Math.max(1, Math.trunc(page));
      updateFilters({ page: safePage } as Partial<CatalogFilters>, { preservePage: true });
    },
    [updateFilters],
  );

  const resetFilters = useCallback(() => {
    const baseline = normalizeCatalogFilters(
      {
        search: DEFAULT_CATALOG_FILTERS.search,
        sort: DEFAULT_CATALOG_FILTERS.sort,
        page: DEFAULT_CATALOG_FILTERS.page,
        limit: filters.limit,
      },
      { categoryId: filters.categoryId, limit: filters.limit },
    );
    pushFilters(baseline);
  }, [filters.categoryId, filters.limit, pushFilters]);

  const buildHref = useCallback(
    (updates?: Partial<CatalogFilters>) => {
      if (!updates || Object.keys(updates).length === 0) {
        const params = catalogFiltersToSearchParams(filters);
        const query = params.toString();
        return query ? `${pathname}?${query}` : pathname;
      }

      const merged = normalizeCatalogFilters(
        { ...filters, ...updates },
        { categoryId: filters.categoryId, limit: filters.limit },
      );
      const needsPageReset = !Object.prototype.hasOwnProperty.call(updates, "page");
      const next = needsPageReset ? { ...merged, page: DEFAULT_CATALOG_FILTERS.page } : merged;
      const params = catalogFiltersToSearchParams(next);
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [filters, pathname],
  );

  return {
    filters,
    isPending,
    updateFilter,
    updateFilters,
    toggleValue,
    setPage,
    resetFilters,
    buildHref,
  };
}
