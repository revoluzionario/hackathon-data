"use client";

import type { Post } from "@/types/api";
import { PostHero } from "@/components/posts/PostHero";
import { PostContent } from "@/components/posts/PostContent";
import { RelatedPosts } from "@/components/posts/RelatedPosts";
import { usePostEvents } from "@/hooks/usePostEvents";
import { getPostSlug } from "@/utils/posts";

interface PostDetailPageProps {
  post: Post;
  relatedPosts: Post[];
}

export function PostDetailPage({ post, relatedPosts }: PostDetailPageProps) {
  const slug = getPostSlug(post);
  usePostEvents(slug);

  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <PostHero post={post} />
      <PostContent content={post.content} />
      <RelatedPosts posts={relatedPosts} />
    </article>
  );
}
