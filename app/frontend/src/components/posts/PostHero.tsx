"use client";

import Image from "next/image";
import type { Post } from "@/types/api";
import { formatDate } from "@/utils/formatters";
import { getPostCoverImage, getPostExcerpt } from "@/utils/posts";

interface PostHeroProps {
  post: Post;
}

export function PostHero({ post }: PostHeroProps) {
  const cover = getPostCoverImage(post, `${post.id}-hero`);
  const dateLabel = formatDate(post.publishAt ?? post.createdAt);
  const summary = getPostExcerpt(post, 200);

  return (
    <header className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-50">
        <div className="relative aspect-[16/9]">
          <Image
            src={cover}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 960px"
          />
        </div>
      </div>
      <div className="space-y-3 text-center">
        {dateLabel && <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">{dateLabel}</p>}
        <h1 className="text-4xl font-semibold text-zinc-900 lg:text-5xl">{post.title}</h1>
        {summary && <p className="text-lg text-zinc-600">{summary}</p>}
      </div>
    </header>
  );
}
