import type { Metadata } from "next";
import { fetchFromApi } from "@/lib/api";
import type { PaginatedPostsResponse } from "@/types/api";
import { PostsSection } from "@/components/PostsSection";
import PaginationBar from "./PaginationBar";

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest posts and editorial from Atlas Commerce",
};

export default async function PostsPage({ searchParams }: Props) {
  const page = Number(searchParams?.page ?? 1) || 1;
  const limit = Number(searchParams?.limit ?? 9) || 9;

  const data = await fetchFromApi<PaginatedPostsResponse>(`/posts?page=${page}&limit=${limit}`);

  return (
    <main className="container mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Our Blog</h1>
        <p className="mt-2 text-sm text-zinc-600">Insights, stories, and product updates from the team.</p>
      </header>

      <PostsSection posts={data.data} />

      <div className="mt-8">
        <PaginationBar meta={data.meta} basePath="/posts" />
      </div>
    </main>
  );
}
import type { Metadata } from "next";
import { PostsListPage } from "@/components/posts";
import { safeFetchPosts } from "@/lib/posts";
import type { PaginatedPostsResponse, Post } from "@/types/api";

const PAGE_SIZE = 9;
const FALLBACK_RESPONSE: PaginatedPostsResponse<Post> = {
  data: [],
  meta: {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  },
};

function parseNumber(value?: string | string[]) {
  if (!value) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseString(value?: string | string[]) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export const metadata: Metadata = {
  title: "Stories & insights | Hackathon Shop",
  description: "Explore stories on personalization, customer journeys, and product launches from the Hackathon team.",
};

export const revalidate = 120;

interface PostsPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function PostsPage({ searchParams = {} }: PostsPageProps) {
  const page = parseNumber(searchParams.page) ?? 1;
  const search = parseString(searchParams.search)?.trim();

  const response = await safeFetchPosts(
    { page, limit: PAGE_SIZE, search },
    { revalidate: 120, tags: ["posts"] },
    {
      ...FALLBACK_RESPONSE,
      meta: {
        ...FALLBACK_RESPONSE.meta,
        page,
        limit: PAGE_SIZE,
      },
    },
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PostsListPage posts={response.data} meta={response.meta} initialSearch={search ?? ""} pageSize={PAGE_SIZE} />
    </main>
  );
}
