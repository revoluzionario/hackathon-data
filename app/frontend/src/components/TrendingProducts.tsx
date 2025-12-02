import type { DisplayProduct } from "@/types/api";
import { ProductCard } from "./ProductCard";

interface TrendingProductsProps {
  products: DisplayProduct[];
}

export function TrendingProducts({ products }: TrendingProductsProps) {
  if (!products.length) {
    return null;
  }

  return (
    <section aria-labelledby="trending-heading" className="mb-16">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Unified intelligence</p>
          <h2 id="trending-heading" className="text-2xl font-semibold text-zinc-900">
            Trending products
          </h2>
          <p className="text-sm text-zinc-500">Powered by real-time views, ML boosts, and weekly momentum.</p>
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
