"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { DisplayProduct } from "@/types/api";
import { formatCurrency } from "@/utils/formatters";
import { sendAnalyticsEvent } from "@/lib/analytics";

interface ProductCardProps {
  product: DisplayProduct;
  analyticsLocation?: string;
  onProductClick?: () => void;
}

export function ProductCard({ product, analyticsLocation = "homepage", onProductClick }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const priceLabel = formatCurrency(product.price ?? 0);

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    await sendAnalyticsEvent({
      eventType: "add_to_cart_click",
      metadata: { productId: product.id, location: analyticsLocation },
    });
    setTimeout(() => setIsAdding(false), 1200);
  };

  return (
    <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm text-emerald-600">{priceLabel}</p>
            <Link
              href={`/products/${product.id}`}
              className="text-lg font-semibold text-zinc-900"
              onClick={() => onProductClick?.()}
            >
              {product.name}
            </Link>
          </div>
          {typeof product.score === "number" && (
            <span className="text-xs text-zinc-500">Score {(product.score ?? 0).toFixed(1)}</span>
          )}
        </div>
        <p className="text-sm text-zinc-600 overflow-hidden text-ellipsis">{product.description}</p>
        <div className="mt-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isAdding}
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
          <Link
            href={`/products/${product.id}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:border-emerald-600 hover:text-emerald-600"
            aria-label={`View ${product.name}`}
            onClick={() => onProductClick?.()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4l2.5 2.5" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
