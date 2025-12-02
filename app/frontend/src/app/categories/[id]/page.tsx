import { notFound } from "next/navigation";
import { CatalogPageClient } from "@/components/catalog/CatalogPageClient";
import { StructuredData } from "@/components/StructuredData";
import { fetchCatalogProducts } from "@/lib/products";
import { safeFetchFromApi } from "@/lib/api";
import type { CatalogFilters, Category, PaginatedProductsResponse } from "@/types/api";
import { deriveFilterOptions, parseCatalogFilters, toDisplayProducts } from "@/utils/catalog";

interface CategoryPageProps {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

async function getCategory(id: number): Promise<Category | null> {
  return safeFetchFromApi<Category | null>(`/categories/${id}`, { revalidate: 300 }, null);
}

async function getCategoryProducts(categoryId: number, filters: CatalogFilters): Promise<PaginatedProductsResponse> {
  return fetchCatalogProducts(filters, { revalidate: 60, tags: [`category:${categoryId}`] });
}

export const revalidate = 60;

export default async function CategoryPage({ params, searchParams = {} }: CategoryPageProps) {
  const categoryId = Number(params.id);
  if (!Number.isFinite(categoryId)) {
    notFound();
  }

  const category = await getCategory(categoryId);
  if (!category) {
    notFound();
  }

  const filters = parseCatalogFilters(searchParams, { categoryId });
  const productsResponse = await getCategoryProducts(categoryId, filters);
  const displayProducts = toDisplayProducts(productsResponse.data, category.name);
  const filterOptions = deriveFilterOptions(productsResponse.data, productsResponse.meta);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <CatalogPageClient
        initialFilters={filters}
        products={displayProducts}
        meta={productsResponse.meta}
        filterOptions={filterOptions}
        categoryName={category.name}
        pageId={`/categories/${categoryId}`}
      />
      <StructuredData products={displayProducts} />
    </main>
  );
}
