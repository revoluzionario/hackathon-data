import type { Post } from "@/types/api";
import { truncate } from "@/utils/formatters";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80&sat=-100&blend=0f172a&blend-mode=multiply";

export function getPostCoverImage(post: Post, seed?: string) {
  if (post.coverImage && post.coverImage.length > 0) {
    return post.coverImage;
  }
  const suffix = seed ?? `${post.slug ?? post.id}`;
  return `${DEFAULT_COVER}&sig=${suffix}`;
}

export function getPostExcerpt(post: Post, length = 160) {
  if (post.excerpt && post.excerpt.trim().length > 0) {
    return truncate(post.excerpt, length);
  }
  if (post.content) {
    const plain = post.content.replace(/[#*_>`]/g, "").replace(/<[^>]+>/g, "").trim();
    if (plain) {
      return truncate(plain, length);
    }
  }
  return "";
}

export function getPostSlug(post: Post) {
  return post.slug ?? String(post.id);
}
