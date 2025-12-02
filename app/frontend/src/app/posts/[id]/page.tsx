import Image from "next/image";
import type { Metadata } from "next";
import { fetchFromApi, safeFetchFromApi } from "@/lib/api";
import type { Post, PaginatedPostsResponse } from "@/types/api";
import { getPostCoverImage } from "@/utils/posts";
import { PostContent } from "@/components/posts/PostContent";
import PostEventsClient from "@/components/posts/PostEventsClient";
import { PostsSection } from "@/components/PostsSection";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const post = await fetchFromApi<Post>(`/posts/${params.id}`);
    return {
      title: post.title,
      description: post.excerpt ?? undefined,
      openGraph: {
        images: post.coverImage ? [{ url: post.coverImage }] : undefined,
      },
    } as Metadata;
  } catch {
    return { title: "Post" };
  }
}

export default async function PostDetailPage({ params }: Props) {
  const post = await fetchFromApi<Post>(`/posts/${params.id}`);

  // try to fetch related posts (non-blocking if endpoint missing)
  let related: Post[] = [];
  try {
    const relatedResp = await safeFetchFromApi<PaginatedPostsResponse>(`/posts?relatedTo=${params.id}&limit=3`, undefined, { data: [], meta: { page: 1, limit: 3, total: 0, totalPages: 0 } });
    related = relatedResp.data ?? [];
  } catch (e) {
    // ignore
  }

  const cover = getPostCoverImage(post);

  return (
    <main className="container mx-auto px-4 py-12">
      <article className="mx-auto max-w-3xl">
        <div className="relative mb-6 h-64 overflow-hidden rounded-2xl md:h-96">
          <Image src={cover} alt={post.title} fill className="object-cover" sizes="100vw" />
        </div>

        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="mt-2 text-sm text-zinc-600">{post.publishAt ?? post.createdAt}</p>

        <div className="mt-8">
          <PostContent content={post.content} />
        </div>

        <PostEventsClient postId={post.id} />

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold">Related posts</h2>
            <div className="mt-4">
              <PostsSection posts={related} />
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
