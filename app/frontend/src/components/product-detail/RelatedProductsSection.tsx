import type { DisplayProduct } from "@/types/api";
import { ProductCard } from "@/components/ProductCard";

interface RelatedProductsSectionProps {
  sections: Array<{ title: string; products: DisplayProduct[] }>;
  onProductClick?: (productId: number, position: number, sectionTitle: string) => void;
}

export function RelatedProductsSection({ sections, onProductClick }: RelatedProductsSectionProps) {
  if (!sections.length) {
    return null;
  }

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section.title} className="space-y-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">{section.title}</p>
            <p className="text-2xl font-semibold text-zinc-900">Because you viewed this</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {section.products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                analyticsLocation="product_detail"
                onProductClick={() => onProductClick?.(product.id, index + 1, section.title)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
