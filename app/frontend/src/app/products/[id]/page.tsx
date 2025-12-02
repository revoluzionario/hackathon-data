import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StructuredData } from "@/components/StructuredData";
import { ProductDetailPage } from "@/components/product-detail";
import { fetchProductById, fetchProductRecommendations, fetchProductReviews } from "@/lib/products";
import { toDisplayProducts } from "@/utils/catalog";
import { buildRecommendationSections, normalizeProductDetail } from "@/utils/product-detail";
import type { DisplayProduct } from "@/types/api";

interface ProductPageProps {
  params: { id: string };
}

async function getProductData(id: string) {
  const product = await fetchProductById(id, { revalidate: 300, tags: [`product:${id}`] });
  if (!product) {
    return null;
  }
  const [related, reviews] = await Promise.all([
    fetchProductRecommendations(id, { revalidate: 600 }),
    fetchProductReviews(id, { revalidate: 300 }),
  ]);
  return { product, related, reviews };
}

export const revalidate = 120;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await fetchProductById(params.id, { revalidate: 600 });
  if (!product) {
    return {
      title: "Product not found | Hackathon Shop",
    };
  }

  const description = product.shortDescription ?? product.description;
  const previewImage = product.gallery?.[0] ?? product.images?.[0];

  return {
    title: `${product.name} | Hackathon Shop`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: previewImage ? [previewImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: previewImage ? [previewImage] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const data = await getProductData(params.id);
  if (!data) {
    notFound();
  }

  const normalized = normalizeProductDetail(data.product);
  const relatedSections = buildRecommendationSections(data.related).map((section) => ({
    title: section.title,
    products: toDisplayProducts(section.items, section.title),
  }));
  const reviews = data.reviews?.data ?? [];

  const featuredProduct: DisplayProduct = {
    id: normalized.id,
    name: normalized.name,
    description: normalized.shortDescription ?? normalized.description,
    price: normalized.finalPrice,
    stock: normalized.stock,
    attributes: normalized.attributes,
    category: normalized.category,
    imageUrl: normalized.primaryImage,
  };

  const structuredProducts = [featuredProduct, ...relatedSections.flatMap((section) => section.products)];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ProductDetailPage product={normalized} relatedSections={relatedSections} reviews={reviews} />
      <StructuredData products={structuredProducts} />
    </main>
  );
}
