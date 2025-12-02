"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PaginatedPostsResponse, Post } from "@/types/api";
import { PostCard } from "@/components/PostCard";
import { SearchInput } from "@/components/posts/SearchInput";
import { PaginationBar } from "@/components/posts/PaginationBar";
import { sendAnalyticsEvent } from "@/lib/analytics";

interface PostsListPageProps {
  posts: Post[];
  meta: PaginatedPostsResponse<Post>["meta"];
  initialSearch?: string;
  pageSize: number;
}

function buildQueryString({ search, page, limit }: { search?: string; page?: number; limit: number }) {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  if (page && page > 1) {
    params.set("page", String(page));
  }
  if (limit) {
    params.set("limit", String(limit));
  }
  return params.toString();
}

export function PostsListPage({ posts, meta, initialSearch = "", pageSize }: PostsListPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    sendAnalyticsEvent({ eventType: "page_view", entityId: "/posts" });
    const timer = setTimeout(() => {
      sendAnalyticsEvent({ eventType: "dwell_time", entityId: "/posts", metadata: { seconds: 5 } });
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      const queryString = buildQueryString({ search: query.trim(), page: 1, limit: pageSize });
      startTransition(() => {
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
      });
    }, 400);
    return () => clearTimeout(handler);
  }, [pathname, pageSize, query, router]);

  const currentQueryString = useMemo(() => searchParams.toString(), [searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(currentQueryString);
    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    params.set("limit", String(pageSize));
    const queryString = params.toString();
    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: true });
    });
  };

  return (
    <section className="space-y-8">
      <header className="space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Stories</p>
        <h1 className="text-4xl font-semibold text-zinc-900">Ideas to accelerate your retail strategy</h1>
        <p className="text-base text-zinc-600">Insights from our team on personalization, customer journeys, and product launches.</p>
      </header>
      <div className="flex flex-col gap-4 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <SearchInput value={query} onChange={setQuery} />
        <div className="text-sm text-zinc-500">{isPending ? "Updating..." : `${posts.length} results on this page`}</div>
      </div>
      {posts.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center">
          <p className="text-lg font-semibold text-emerald-700">No posts match your search.</p>
          <p className="text-sm text-emerald-900">Try adjusting your keywords or check back soon for new stories.</p>
        </div>
      )}
      <PaginationBar currentPage={meta.page} totalPages={Math.max(1, meta.totalPages)} onPageChange={handlePageChange} />
    </section>
  );
}
