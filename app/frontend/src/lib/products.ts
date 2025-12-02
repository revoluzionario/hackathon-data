import type {
  CatalogFilters,
  PaginatedProductsResponse,
  ProductDetail,
  ProductRecommendationsResponse,
  ProductReviewsResponse,
} from "@/types/api";
import { fetchFromApi, safeFetchFromApi, type ApiFetchOptions } from "@/lib/api";
import { catalogFiltersToSearchParams } from "@/utils/catalog";

export async function fetchCatalogProducts(
  filters: CatalogFilters,
  options?: ApiFetchOptions,
): Promise<PaginatedProductsResponse> {
  const params = catalogFiltersToSearchParams(filters);
  const query = params.toString();
  const path = query ? `/products?${query}` : "/products";
  return fetchFromApi<PaginatedProductsResponse>(path, options);
}

export async function fetchProductById(id: string | number, options?: ApiFetchOptions) {
  const productId = typeof id === "string" ? id : String(id);
  return safeFetchFromApi<ProductDetail>(`/products/${productId}`, options);
}

export async function fetchProductRecommendations(id: string | number, options?: ApiFetchOptions) {
  const productId = typeof id === "string" ? id : String(id);
  return safeFetchFromApi<ProductRecommendationsResponse>(
    `/recommendations/product/${productId}`,
    { revalidate: options?.revalidate ?? 60, tags: options?.tags ?? [`product:${productId}:related`] },
    { similar: [], coViewed: [], mlSimilar: [] },
  );
}

export async function fetchProductReviews(id: string | number, options?: ApiFetchOptions) {
  const productId = typeof id === "string" ? id : String(id);
  return safeFetchFromApi<ProductReviewsResponse>(
    `/products/${productId}/reviews`,
    options,
    { data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 1 } },
  );
}
