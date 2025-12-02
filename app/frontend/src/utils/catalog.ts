import type {
  CatalogFilterOptions,
  CatalogFilters,
  CatalogSort,
  DisplayProduct,
  Product,
  ProductListMeta,
} from "@/types/api";
import { resolveImageFromAttributes } from "@/utils/formatters";

const DEFAULT_PLACEHOLDER =
  "https://images.unsplash.com/photo-1512299287842-31f785e49205?auto=format&fit=crop&w=1200&q=80";

export const DEFAULT_CATALOG_LIMIT = 12;
export const DEFAULT_CATALOG_SORT: CatalogSort = "popularity";
export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  search: "",
  sort: DEFAULT_CATALOG_SORT,
  colors: [],
  sizes: [],
  materials: [],
  minPrice: undefined,
  maxPrice: undefined,
  page: 1,
  limit: DEFAULT_CATALOG_LIMIT,
  categoryId: undefined,
};

export const MULTI_FILTER_KEYS = ["colors", "sizes", "materials"] as const;
export type CatalogMultiFilterKey = (typeof MULTI_FILTER_KEYS)[number];

const MULTI_PARAM_MAP: Record<CatalogMultiFilterKey, string> = {
  colors: "color",
  sizes: "size",
  materials: "material",
};

function normalizeToken(value?: string | null) {
  return value?.toString().trim().toLowerCase() ?? "";
}

export function normalizeListValue(value: string) {
  return value.trim().toLowerCase();
}

export function parseListParam(value?: string | string[] | null): string[] {
  if (!value) {
    return [];
  }
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((part) => normalizeListValue(part))
    .filter(Boolean);
}

export function parseNumberParam(value?: string | null): number | undefined {
  if (value == null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeSort(value?: string): CatalogSort {
  if (value === "price_asc" || value === "price_desc" || value === "popularity" || value === "rating") {
    return value;
  }
  return DEFAULT_CATALOG_SORT;
}

export function normalizeCatalogFilters(
  partial?: Partial<CatalogFilters>,
  options?: { categoryId?: number; limit?: number },
): CatalogFilters {
  const resolvedPage = partial?.page;
  const resolvedLimit = options?.limit ?? partial?.limit;
  const resolvedCategory = options?.categoryId ?? partial?.categoryId;
  const resolvedMinPrice = partial?.minPrice;
  const resolvedMaxPrice = partial?.maxPrice;

  const page = Number.isFinite(resolvedPage) ? Math.max(1, Math.trunc(Number(resolvedPage))) : DEFAULT_CATALOG_FILTERS.page;
  const limitCandidate = Number.isFinite(resolvedLimit) ? Number(resolvedLimit) : DEFAULT_CATALOG_FILTERS.limit;
  const limit = Math.min(48, Math.max(1, Math.trunc(limitCandidate)));
  const categoryId = Number.isFinite(resolvedCategory) ? Number(resolvedCategory) : undefined;
  const minPrice = Number.isFinite(resolvedMinPrice) ? Number(resolvedMinPrice) : undefined;
  const maxPrice = Number.isFinite(resolvedMaxPrice) ? Number(resolvedMaxPrice) : undefined;

  return {
    search: partial?.search?.toString() ?? DEFAULT_CATALOG_FILTERS.search,
    sort: normalizeSort(partial?.sort),
    colors: partial?.colors?.map(normalizeListValue) ?? [],
    sizes: partial?.sizes?.map(normalizeListValue) ?? [],
    materials: partial?.materials?.map(normalizeListValue) ?? [],
    minPrice,
    maxPrice,
    page,
    limit,
    categoryId,
  } satisfies CatalogFilters;
}

export function parseCatalogFilters(
  searchParams: Record<string, string | string[] | undefined>,
  options?: { defaultLimit?: number; categoryId?: number },
): CatalogFilters {
  const normalized = normalizeCatalogFilters(
    {
      search: searchParams.search as string,
      sort: searchParams.sort as CatalogSort,
      colors: parseListParam(searchParams.color),
      sizes: parseListParam(searchParams.size),
      materials: parseListParam(searchParams.material),
      minPrice: parseNumberParam(searchParams.minPrice as string | undefined),
      maxPrice: parseNumberParam(searchParams.maxPrice as string | undefined),
      page: parseNumberParam(searchParams.page as string | undefined),
      limit: parseNumberParam(searchParams.limit as string | undefined) ?? options?.defaultLimit,
      categoryId: parseNumberParam(searchParams.categoryId as string | undefined),
    },
    {
      categoryId: options?.categoryId,
      limit: options?.defaultLimit,
    },
  );
  return normalized;
}

export function catalogFiltersToSearchParams(
  filters: CatalogFilters,
  options?: { includeDefaults?: boolean },
): URLSearchParams {
  const params = new URLSearchParams();
  const includeDefaults = options?.includeDefaults ?? false;

  const base = normalizeCatalogFilters(filters);

  if (base.search || includeDefaults) {
    params.set("search", base.search);
  }

  if (includeDefaults || base.sort !== DEFAULT_CATALOG_FILTERS.sort) {
    params.set("sort", base.sort);
  }

  for (const key of MULTI_FILTER_KEYS) {
    const values = base[key];
    if (values.length) {
      params.set(MULTI_PARAM_MAP[key], values.join(","));
    } else if (includeDefaults) {
      params.delete(MULTI_PARAM_MAP[key]);
    }
  }

  if (base.minPrice != null) {
    params.set("minPrice", String(base.minPrice));
  } else if (includeDefaults) {
    params.delete("minPrice");
  }

  if (base.maxPrice != null) {
    params.set("maxPrice", String(base.maxPrice));
  } else if (includeDefaults) {
    params.delete("maxPrice");
  }

  if (includeDefaults || base.page !== DEFAULT_CATALOG_FILTERS.page) {
    params.set("page", String(base.page));
  }

  if (includeDefaults || base.limit !== DEFAULT_CATALOG_FILTERS.limit) {
    params.set("limit", String(base.limit));
  }

  if (base.categoryId) {
    params.set("categoryId", String(base.categoryId));
  } else if (includeDefaults) {
    params.delete("categoryId");
  }

  return params;
}

export function buildCatalogQueryString(filters: CatalogFilters, overrides?: Partial<CatalogFilters>) {
  const merged = normalizeCatalogFilters({ ...filters, ...(overrides ?? {}) });
  const params = catalogFiltersToSearchParams(merged);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function hasActiveCatalogFilters(filters: CatalogFilters) {
  if (filters.search) return true;
  if (filters.colors.length || filters.sizes.length || filters.materials.length) return true;
  if (filters.minPrice != null || filters.maxPrice != null) return true;
  return false;
}

export function deriveFilterOptions(products: Product[], meta?: ProductListMeta): CatalogFilterOptions {
  const colorSet = new Set<string>();
  const sizeSet = new Set<string>();
  const materialSet = new Set<string>();
  const priceValues: number[] = [];

  products.forEach((product) => {
    const { attributes } = product;
    if (attributes?.color) colorSet.add(normalizeToken(attributes.color));
    if (attributes?.size) sizeSet.add(normalizeToken(attributes.size));
    if (attributes?.material) materialSet.add(normalizeToken(attributes.material));
    const price = Number(product.price);
    if (Number.isFinite(price)) {
      priceValues.push(price);
    }
  });

  const calculatedRange = priceValues.length
    ? {
        min: Math.min(...priceValues),
        max: Math.max(...priceValues),
      }
    : null;

  return {
    colors: Array.from(colorSet).filter(Boolean).sort(),
    sizes: Array.from(sizeSet).filter(Boolean).sort(),
    materials: Array.from(materialSet).filter(Boolean).sort(),
    priceRange: meta?.priceRange ?? calculatedRange,
  };
}

export function toDisplayProducts(products: Product[], badge?: string): DisplayProduct[] {
  return products.map((product, index) => ({
    ...product,
    badge,
    imageUrl: resolveImageFromAttributes(product.attributes, `${DEFAULT_PLACEHOLDER}&sig=${product.id}-${index}`),
  }));
}

export function formatPriceLabel(value?: number) {
  if (value == null || !Number.isFinite(value)) {
    return undefined;
  }
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}