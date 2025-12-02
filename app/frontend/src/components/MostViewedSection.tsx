import type { DisplayProduct } from "@/types/api";
import { ProductCard } from "./ProductCard";

interface MostViewedSectionProps {
  products: DisplayProduct[];
}

export function MostViewedSection({ products }: MostViewedSectionProps) {
  if (!products.length) {
    return null;
  }

  return (
    <section aria-labelledby="most-viewed-heading" className="mb-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Real-time insight</p>
          <h2 id="most-viewed-heading" className="text-2xl font-semibold text-zinc-900">
            Most viewed right now
          </h2>
          <p className="text-sm text-zinc-500">
            Aggregated from live sessions and recent campaigns every 10 seconds.
          </p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
