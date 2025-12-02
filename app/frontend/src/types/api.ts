export interface Category {
  id: number;
  name: string;
}

export interface ProductAttributeMap {
  color?: string;
  size?: string;
  material?: string;
  image?: string;
  imageUrl?: string;
  thumbnail?: string;
  rating?: number;
  popularity?: number;
  [key: string]: unknown;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  attributes?: ProductAttributeMap;
  category?: Category;
  createdAt?: string;
}

export interface RecommendationItem {
  productId: number;
  score: number;
}

export interface ProductVariantOptions {
  colors?: string[];
  sizes?: string[];
  materials?: string[];
}

export interface ProductSpecificationsMap {
  [key: string]: string | number | undefined | null;
}

export interface ProductDetail extends Product {
  shortDescription?: string;
  longDescription?: string;
  discountPercentage?: number;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  gallery?: string[];
  variants?: ProductVariantOptions;
  specs?: ProductSpecificationsMap;
  materialsList?: string[];
  dimensions?: string;
  weight?: string;
  careInstructions?: string[];
  details?: string[];
}

export interface HomepageRecommendations {
  trending: RecommendationItem[];
  weekly: RecommendationItem[];
}

export interface PaginatedPostsResponse<T = Post> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  content?: string;
  createdAt?: string;
  publishAt?: string | null;
}

export interface DisplayProduct extends Product {
  imageUrl: string;
  badge?: string;
  score?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListMeta extends PaginationMeta {
  priceRange?: {
    min: number;
    max: number;
  } | null;
}

export interface PaginatedProductsResponse {
  data: Product[];
  meta: ProductListMeta;
}

export type CatalogSort = 'price_asc' | 'price_desc' | 'popularity' | 'rating';

export interface CatalogFilters {
  search: string;
  sort: CatalogSort;
  colors: string[];
  sizes: string[];
  materials: string[];
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
  categoryId?: number;
}

export interface CatalogFilterOptions {
  colors: string[];
  sizes: string[];
  materials: string[];
  priceRange: {
    min: number;
    max: number;
  } | null;
}

export interface ProductRecommendationsResponse {
  similar?: Product[];
  coViewed?: Product[];
  mlSimilar?: Product[];
}

export interface ProductReview {
  id: number | string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductReviewsResponse {
  data: ProductReview[];
  meta?: PaginationMeta;
}
