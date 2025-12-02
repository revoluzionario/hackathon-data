"use client";

import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types/api";
import { getPostCoverImage, getPostExcerpt, getPostSlug } from "@/utils/posts";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const cover = getPostCoverImage(post);
  const excerpt = getPostExcerpt(post, 120);
  const slug = getPostSlug(post);
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-48">
        <Image
          src={cover}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-lg font-semibold text-zinc-900">{post.title}</h3>
        {excerpt && <p className="text-sm text-zinc-600">{excerpt}</p>}
        <Link
          href={`/posts/${slug}`}
          className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500"
        >
          Read more
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
