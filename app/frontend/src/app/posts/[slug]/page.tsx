import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostDetailPage } from "@/components/posts";
import { fetchPostBySlug, fetchRelatedPosts } from "@/lib/posts";
import { getPostCoverImage, getPostExcerpt, getPostSlug } from "@/utils/posts";

interface PostPageProps {
  params: { slug: string };
}

export const revalidate = 300;

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await fetchPostBySlug(params.slug, { revalidate: 600, tags: [`post:${params.slug}`] });
  if (!post) {
    return {
      title: "Post not found | Hackathon Blog",
    };
  }

  const slug = getPostSlug(post);
  const description = getPostExcerpt(post, 180) || post.excerpt || undefined;
  const cover = getPostCoverImage(post, `${slug}-meta`);

  return {
    title: `${post.title} | Hackathon Blog`,
    description,
    openGraph: {
      title: post.title,
      description,
      images: [cover],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [cover],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await fetchPostBySlug(params.slug, { revalidate: 300, tags: [`post:${params.slug}`] });
  if (!post) {
    notFound();
  }
  const relatedPosts = await fetchRelatedPosts(params.slug, 3, { revalidate: 600, tags: ["posts", `post:${params.slug}:related`] });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <PostDetailPage post={post} relatedPosts={relatedPosts} />
    </main>
  );
}
