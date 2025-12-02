"use client";

import type { DisplayProduct } from "@/types/api";
import { ProductCard } from "@/components/ProductCard";

interface CatalogProductGridProps {
  products: DisplayProduct[];
  analyticsLocation?: string;
  offset?: number;
  onProductClick?: (productId: number, position: number) => void;
}

export function CatalogProductGrid({
  products,
  analyticsLocation = "catalog",
  offset = 0,
  onProductClick,
}: CatalogProductGridProps) {
  if (!products.length) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => {
        const position = offset + index + 1;
        return (
          <ProductCard
            key={product.id}
            product={product}
            analyticsLocation={analyticsLocation}
            onProductClick={() => onProductClick?.(product.id, position)}
          />
        );
      })}
    </div>
  );
}
