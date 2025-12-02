import type { PaginatedPostsResponse, Post } from "@/types/api";
import { fetchFromApi, safeFetchFromApi, type ApiFetchOptions } from "@/lib/api";

export interface PostListParams {
  page?: number;
  limit?: number;
  search?: string;
  relatedTo?: string | number;
}

const DEFAULT_POSTS_FALLBACK: PaginatedPostsResponse<Post> = {
  data: [],
  meta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
};

function buildPostsQuery(params: PostListParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit && params.limit > 0) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.search) {
    searchParams.set("search", params.search.trim());
  }

  if (params.relatedTo) {
    searchParams.set("relatedTo", String(params.relatedTo));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function fetchPosts(params: PostListParams = {}, options?: ApiFetchOptions) {
  const query = buildPostsQuery(params);
  return fetchFromApi<PaginatedPostsResponse<Post>>(`/posts${query}`, options);
}

export async function safeFetchPosts(
  params: PostListParams = {},
  options?: ApiFetchOptions,
  fallback: PaginatedPostsResponse<Post> = DEFAULT_POSTS_FALLBACK,
) {
  const query = buildPostsQuery(params);
  return safeFetchFromApi<PaginatedPostsResponse<Post>>(`/posts${query}`, options, fallback);
}

export async function fetchPostBySlug(slug: string, options?: ApiFetchOptions) {
  try {
    return await fetchFromApi<Post>(`/posts/${slug}`, options);
  } catch (error) {
    console.warn(`Failed to fetch post ${slug}:`, error);
    return undefined;
  }
}

export async function fetchRelatedPosts(currentSlug: string, limit = 3, options?: ApiFetchOptions) {
  const response = await safeFetchPosts({ limit: limit + 2 }, options, DEFAULT_POSTS_FALLBACK);
  return response.data.filter((post) => post.slug !== currentSlug).slice(0, limit);
}
