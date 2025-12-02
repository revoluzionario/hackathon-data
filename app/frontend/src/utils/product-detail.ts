import type {
  Category,
  Product,
  ProductDetail,
  ProductRecommendationsResponse,
  ProductVariantOptions,
} from "@/types/api";
import { resolveImageFromAttributes } from "@/utils/formatters";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=1600&q=80",
];

export type VariantSelection = {
  color?: string;
  size?: string;
  material?: string;
};

export interface ProductSpecificationItem {
  label: string;
  value: string;
}

export interface NormalizedProductDetail {
  id: number;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPercentage?: number;
  finalPrice: number;
  rating?: number;
  reviewCount?: number;
  stock: number;
  isInStock: boolean;
  attributes?: ProductDetail["attributes"];
  category?: Category;
  gallery: string[];
  primaryImage: string;
  variants: Required<ProductVariantOptions>;
  defaultVariant: VariantSelection;
  specs: ProductSpecificationItem[];
  details: string[];
  materials: string[];
  dimensions?: string;
  weight?: string;
  careInstructions: string[];
}

function uniqueList(values: Array<string | undefined | null>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim())))).map((value) =>
    value.trim(),
  );
}

function formatSpecLabel(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function buildSpecs(product: ProductDetail): ProductSpecificationItem[] {
  if (!product.specs) {
    return [];
  }
  return Object.entries(product.specs)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => ({ label: formatSpecLabel(key), value: String(value) }));
}

function ensureVariantOptions(product: ProductDetail): Required<ProductVariantOptions> {
  return {
    colors: uniqueList([...(product.variants?.colors ?? []), product.attributes?.color]),
    sizes: uniqueList([...(product.variants?.sizes ?? []), product.attributes?.size]),
    materials: uniqueList([...(product.variants?.materials ?? []), product.attributes?.material]),
  };
}

export function normalizeProductDetail(product: ProductDetail): NormalizedProductDetail {
  const price = Number(product.price ?? 0);
  const discount = Number(product.discountPercentage ?? 0);
  const finalPrice = Number((price * (100 - discount)) / 100);
  const fallbackImage = resolveImageFromAttributes(product.attributes, `${PLACEHOLDER_IMAGES[0]}&sig=${product.id}`);
  const combinedGallery = uniqueList([...(product.gallery ?? []), ...(product.images ?? []), fallbackImage]);
  const gallery = combinedGallery.length ? combinedGallery : PLACEHOLDER_IMAGES.map((url, index) => `${url}&sig=${product.id}-${index}`);
  const variants = ensureVariantOptions(product);

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    price,
    discountPercentage: discount || undefined,
    finalPrice: discount ? Number(finalPrice.toFixed(2)) : price,
    rating: product.rating ?? (product.attributes?.rating as number | undefined),
    reviewCount: product.reviewCount,
    stock: product.stock ?? 0,
    isInStock: (product.stock ?? 0) > 0,
    attributes: product.attributes,
    category: product.category,
    gallery,
    primaryImage: gallery[0],
    variants,
    defaultVariant: {
      color: variants.colors[0],
      size: variants.sizes[0],
      material: variants.materials[0],
    },
    specs: buildSpecs(product),
    details: product.details?.length ? product.details : [product.longDescription ?? product.description].filter(Boolean),
    materials: uniqueList([...(product.materialsList ?? []), product.attributes?.material]),
    dimensions: product.dimensions,
    weight: product.weight,
    careInstructions: product.careInstructions ?? [],
  };
}

export function buildRecommendationSections(
  related: ProductRecommendationsResponse | undefined,
): Array<{ title: string; items: Product[] }> {
  if (!related) {
    return [];
  }

  const sections: Array<{ title: string; items: Product[] }> = [];
  if (related.similar?.length) {
    sections.push({ title: "Similar products", items: related.similar });
  }
  if (related.coViewed?.length) {
    sections.push({ title: "Frequently viewed together", items: related.coViewed });
  }
  if (related.mlSimilar?.length) {
    sections.push({ title: "You might also like", items: related.mlSimilar });
  }
  return sections;
}