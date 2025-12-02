import { CatalogPageClient } from "@/components/catalog/CatalogPageClient";
import { StructuredData } from "@/components/StructuredData";
import { fetchCatalogProducts } from "@/lib/products";
import type { CatalogFilters, PaginatedProductsResponse } from "@/types/api";
import { deriveFilterOptions, parseCatalogFilters, toDisplayProducts } from "@/utils/catalog";

interface ProductsPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

async function getProducts(filters: CatalogFilters): Promise<PaginatedProductsResponse> {
  const response = await fetchCatalogProducts(filters, { revalidate: 60, tags: ["products"] });
  return response;
}

export const revalidate = 60;

export default async function ProductsPage({ searchParams = {} }: ProductsPageProps) {
  const filters = parseCatalogFilters(searchParams);
  const productsResponse = await getProducts(filters);
  const displayProducts = toDisplayProducts(productsResponse.data);
  const filterOptions = deriveFilterOptions(productsResponse.data, productsResponse.meta);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <CatalogPageClient
        initialFilters={filters}
        products={displayProducts}
        meta={productsResponse.meta}
        filterOptions={filterOptions}
        pageId="/products"
      />
      <StructuredData products={displayProducts} />
    </main>
  );
}
