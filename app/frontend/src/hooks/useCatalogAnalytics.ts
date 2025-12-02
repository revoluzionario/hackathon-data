"use client";

import { useCallback, useEffect, useMemo } from "react";
import type { CatalogFilters, CatalogSort } from "@/types/api";
import { sendAnalyticsEvent } from "@/lib/analytics";

interface UseCatalogAnalyticsOptions {
  pageId?: string;
  categoryId?: number;
  filters?: CatalogFilters;
}

export interface CatalogAnalyticsHandlers {
  trackView: () => void;
  trackFilterChange: (filterKey: string, value: unknown) => void;
  trackSortChange: (sort: CatalogSort) => void;
  trackPagination: (page: number) => void;
  trackProductImpression: (productId: number, position?: number) => void;
  trackProductClick: (productId: number, position?: number) => void;
}

function buildFiltersMetadata(filters?: CatalogFilters) {
  if (!filters) {
    return undefined;
  }

  return {
    page: filters.page,
    pageSize: filters.limit,
    sort: filters.sort,
    search: filters.search || undefined,
    colorCount: filters.colors.length,
    sizeCount: filters.sizes.length,
    materialCount: filters.materials.length,
    hasPriceFilter: filters.minPrice != null || filters.maxPrice != null,
  };
}

export function useCatalogAnalytics(options: UseCatalogAnalyticsOptions = {}): CatalogAnalyticsHandlers {
  const { pageId, categoryId, filters } = options;
  const resolvedPageId = pageId ?? (categoryId ? `/categories/${categoryId}` : "/products");

  const filtersMetadata = useMemo(() => buildFiltersMetadata(filters), [filters]);

  const sendEvent = useCallback(
    (eventType: string, metadata?: Record<string, unknown>) => {
      void sendAnalyticsEvent({
        eventType,
        entityId: resolvedPageId,
        metadata: {
          categoryId,
          ...metadata,
        },
      });
    },
    [categoryId, resolvedPageId],
  );

  const trackView = useCallback(() => {
    sendEvent("catalog_view", filtersMetadata);
  }, [filtersMetadata, sendEvent]);

  useEffect(() => {
    trackView();
  }, [trackView]);

  const trackFilterChange = useCallback(
    (filterKey: string, value: unknown) => {
      sendEvent("catalog_filter_change", { filterKey, value });
    },
    [sendEvent],
  );

  const trackSortChange = useCallback(
    (sort: CatalogSort) => {
      sendEvent("catalog_sort_change", { sort });
    },
    [sendEvent],
  );

  const trackPagination = useCallback(
    (page: number) => {
      sendEvent("catalog_pagination", { page: Math.max(1, Math.trunc(page)) });
    },
    [sendEvent],
  );

  const trackProductImpression = useCallback(
    (productId: number, position?: number) => {
      sendEvent("catalog_product_impression", { productId, position });
    },
    [sendEvent],
  );

  const trackProductClick = useCallback(
    (productId: number, position?: number) => {
      sendEvent("catalog_product_click", { productId, position });
    },
    [sendEvent],
  );

  return {
    trackView,
    trackFilterChange,
    trackSortChange,
    trackPagination,
    trackProductImpression,
    trackProductClick,
  };
}
