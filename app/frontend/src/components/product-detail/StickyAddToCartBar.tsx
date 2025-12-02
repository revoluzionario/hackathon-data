"use client";

import { formatCurrency } from "@/utils/formatters";
import type { NormalizedProductDetail } from "@/utils/product-detail";

interface StickyAddToCartBarProps {
  product: NormalizedProductDetail;
  quantity: number;
  isAdding: boolean;
  onAddToCart: () => Promise<void> | void;
}

export function StickyAddToCartBar({ product, quantity, isAdding, onAddToCart }: StickyAddToCartBarProps) {
  if (!product.isInStock) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 p-4 shadow-2xl backdrop-blur lg:hidden">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm text-zinc-500">Subtotal</p>
          <p className="text-xl font-semibold text-zinc-900">
            {formatCurrency(product.finalPrice * quantity)}
          </p>
        </div>
        <button
          type="button"
          onClick={onAddToCart}
          className="ml-auto inline-flex flex-1 items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isAdding}
        >
          {isAdding ? "Adding..." : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
