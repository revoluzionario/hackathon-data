"use client";

import type { Post } from "@/types/api";
import { PostCard } from "@/components/PostCard";

interface RelatedPostsProps {
  posts: Post[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Keep reading</p>
        <h2 className="text-2xl font-semibold text-zinc-900">Related stories</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
