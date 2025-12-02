"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PostContentProps {
  content?: string | null;
}

function isLikelyHtml(value: string) {
  return /<[^>]+>/.test(value);
}

export function PostContent({ content }: PostContentProps) {
  if (!content) {
    return (
      <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-center text-emerald-900">
        <p className="font-semibold">Content is coming soon.</p>
      </div>
    );
  }

  if (isLikelyHtml(content)) {
    return (
      <article className="prose prose-lg prose-zinc mx-auto max-w-none dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>
    );
  }

  return (
    <ReactMarkdown
      className="prose prose-lg prose-zinc mx-auto max-w-none dark:prose-invert"
      remarkPlugins={[remarkGfm]}
      linkTarget="_blank"
    >
      {content}
    </ReactMarkdown>
  );
}
