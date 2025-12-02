import type { ProductReview } from "@/types/api";

interface ProductReviewsSectionProps {
  reviews: ProductReview[];
}

export function ProductReviewsSection({ reviews }: ProductReviewsSectionProps) {
  if (!reviews.length) {
    return (
      <section className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-center text-zinc-600">
        <p className="font-semibold text-emerald-700">No reviews yet</p>
        <p className="text-sm">Be the first to share how you style this piece.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Customer stories</p>
          <p className="text-2xl font-semibold text-zinc-900">Rated by design lovers</p>
        </div>
        <button type="button" className="text-sm font-semibold text-emerald-600">
          Write a review
        </button>
      </div>
      <div className="space-y-4">
        {reviews.slice(0, 3).map((review) => (
          <article key={review.id} className="space-y-2 rounded-2xl border border-zinc-100 p-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              <span className="font-semibold text-zinc-800">{review.author}</span>
              <span>Rated {review.rating}/5</span>
            </div>
            <p className="text-base text-zinc-700">{review.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
