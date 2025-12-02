import { HeroBanner } from "@/components/HeroBanner";
import { CategorySection } from "@/components/CategorySection";
import { TrendingProducts } from "@/components/TrendingProducts";
import { MostViewedSection } from "@/components/MostViewedSection";
import { PostsSection } from "@/components/PostsSection";
import { HomepageEventBridge } from "@/components/HomepageEventBridge";
import { StructuredData } from "@/components/StructuredData";
import { safeFetchFromApi } from "@/lib/api";
import type {
  Category,
  DisplayProduct,
  HomepageRecommendations,
  PaginatedPostsResponse,
  Post,
  Product,
  RecommendationItem,
} from "@/types/api";
import { resolveImageFromAttributes } from "@/utils/formatters";

const HERO_CONTENT = {
  title: "Personalized commerce powered by real-time intelligence",
  subtitle:
    "Fuse Fabric Eventstream signals, ONNX recommendations, and editorial storytelling into one inspiring shopping moment.",
  imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  ctaText: "Shop the collection",
  ctaHref: "/products",
};

const PLACEHOLDER_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80";

async function getHomepageData() {
  const [categories, recommendations, postsResponse, products] = await Promise.all([
    safeFetchFromApi<Category[]>("/categories", { revalidate: 3600 }, []),
    safeFetchFromApi<HomepageRecommendations>(
      "/recommendations/homepage",
      { revalidate: 30 },
      { trending: [], weekly: [] },
    ),
    safeFetchFromApi<PaginatedPostsResponse<Post>>("/posts?limit=3", { revalidate: 300 }, {
      data: [],
      meta: { page: 1, limit: 3, total: 0, totalPages: 1 },
    }),
    safeFetchFromApi<Product[]>("/products", { revalidate: 300 }, []),
  ]);

  return { categories, recommendations, posts: postsResponse.data ?? [], products };
}

function productImage(product: Product, seed: string) {
  const fallback = `${PLACEHOLDER_PRODUCT_IMAGE}&sig=${seed}`;
  return resolveImageFromAttributes(product.attributes, fallback);
}

function hydrateProducts(
  items: RecommendationItem[],
  allProducts: Product[],
  badge: string,
): DisplayProduct[] {
  if (!items.length || !allProducts.length) {
    return [];
  }

  const productMap = new Map<number, Product>(allProducts.map((product) => [product.id, product]));

  return items
    .map((item, index) => {
      const base = productMap.get(item.productId);
      if (!base) {
        return null;
      }
      return {
        ...base,
        badge,
        imageUrl: productImage(base, `${badge}-${index}`),
        score: item.score,
      } satisfies DisplayProduct;
    })
    .filter((p): p is DisplayProduct => Boolean(p));
}

export default async function HomePage() {
  const { categories, recommendations, posts, products } = await getHomepageData();

  const trendingProducts = hydrateProducts(recommendations.trending ?? [], products, "Trending").slice(0, 4);
  const mostViewedProducts = hydrateProducts(recommendations.weekly ?? [], products, "Most viewed").slice(0, 4);
  const topCategories = categories.slice(0, 6);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <HomepageEventBridge />
      <HeroBanner {...HERO_CONTENT} />
      <CategorySection categories={topCategories} />
      <TrendingProducts products={trendingProducts} />
      <MostViewedSection products={mostViewedProducts} />
      <PostsSection posts={posts} />
      <StructuredData products={trendingProducts} />
    </main>
  );
}
