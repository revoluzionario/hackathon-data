import type { Post } from "@/types/api";
import { PostCard } from "./PostCard";

interface PostsSectionProps {
  posts: Post[];
}

export function PostsSection({ posts }: PostsSectionProps) {
  if (!posts.length) {
    return null;
  }

  return (
    <section aria-labelledby="posts-heading" className="mb-24">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">Stories</p>
          <h2 id="posts-heading" className="text-2xl font-semibold text-zinc-900">
            Latest from the lab
          </h2>
          <p className="text-sm text-zinc-500">Fresh POV on analytics, product launches, and customer stories.</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
