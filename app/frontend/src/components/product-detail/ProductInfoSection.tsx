"use client";

import type { NormalizedProductDetail, VariantSelection } from "@/utils/product-detail";
import { formatCurrency } from "@/utils/formatters";
import { VariantSelector } from "./VariantSelector";
import { QuantitySelector } from "./QuantitySelector";

interface ProductInfoSectionProps {
  product: NormalizedProductDetail;
  selection: VariantSelection;
  onVariantChange: (key: keyof VariantSelection, value: string) => void;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onAddToCart: () => Promise<void> | void;
  isAdding: boolean;
  feedback?: { status: "success" | "error"; message: string } | null;
}

const variantLabels: Record<keyof VariantSelection, string> = {
  color: "Color",
  size: "Size",
  material: "Material",
};

export function ProductInfoSection({
  product,
  selection,
  onVariantChange,
  quantity,
  onQuantityChange,
  onAddToCart,
  isAdding,
  feedback,
}: ProductInfoSectionProps) {
  const canAddToCart = product.isInStock && !isAdding;
  const fullPrice = formatCurrency(product.price);
  const dealPrice = formatCurrency(product.finalPrice);
  const showDiscount = Boolean(product.discountPercentage);
  const maxQuantity = product.stock > 0 ? Math.min(product.stock, 10) : 10;

  return (
    <section className="space-y-6 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Featured product</p>
          <h1 className="text-3xl font-semibold text-zinc-900">{product.name}</h1>
          {product.shortDescription && <p className="mt-2 text-base text-zinc-600">{product.shortDescription}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-zinc-900">{dealPrice}</span>
              {showDiscount && <span className="text-lg text-zinc-400 line-through">{fullPrice}</span>}
            </div>
            {showDiscount && (
              <p className="text-sm font-medium text-emerald-600">Save {product.discountPercentage}% today</p>
            )}
          </div>
          {typeof product.rating === "number" && (
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <span>★ {product.rating.toFixed(1)}</span>
              {product.reviewCount && <span className="text-zinc-500">({product.reviewCount} reviews)</span>}
            </div>
          )}
          <div className={`ml-auto rounded-full px-3 py-1 text-sm font-medium ${product.isInStock ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {product.isInStock ? "In stock" : "Out of stock"}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {(product.variants.colors.length || product.variants.sizes.length || product.variants.materials.length) && (
          <div className="space-y-4">
            {(
              [
                { key: "color" as const, options: product.variants.colors, value: selection.color },
                { key: "size" as const, options: product.variants.sizes, value: selection.size },
                { key: "material" as const, options: product.variants.materials, value: selection.material },
              ]
            ).map(({ key, options, value }) => {
              if (!options.length) {
                return null;
              }
              return (
                <VariantSelector
                  key={key}
                  label={variantLabels[key]}
                  options={options}
                  value={value}
                  onSelect={(next) => onVariantChange(key, next)}
                />
              );
            })}
          </div>
        )}
      </div>
      <div className="space-y-3 rounded-2xl bg-zinc-50 p-4">
        <p className="text-sm font-medium text-zinc-500">Quantity</p>
        <QuantitySelector value={quantity} onChange={onQuantityChange} max={maxQuantity} />
        <p className="text-xs text-zinc-500">Free delivery in 2-4 days • 30-day returns</p>
      </div>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onAddToCart}
          className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canAddToCart}
        >
          {isAdding ? "Adding to cart..." : product.isInStock ? "Add to cart" : "Out of stock"}
        </button>
        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-full border border-zinc-200 px-6 py-3 text-base font-semibold text-zinc-900 transition hover:border-emerald-500 hover:text-emerald-600"
        >
          Schedule in-store viewing
        </button>
        {feedback && (
          <p className={`text-sm ${feedback.status === "success" ? "text-emerald-600" : "text-rose-600"}`}>{
            feedback.message
          }</p>
        )}
      </div>
    </section>
  );
}
