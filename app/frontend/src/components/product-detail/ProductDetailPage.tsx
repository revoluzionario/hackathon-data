"use client";

import { useState } from "react";
import type { DisplayProduct, ProductReview } from "@/types/api";
import type { NormalizedProductDetail, VariantSelection } from "@/utils/product-detail";
import {
  ProductDescription,
  ProductImagesCarousel,
  ProductInfoSection,
  ProductReviewsSection,
  ProductSpecifications,
  RelatedProductsSection,
  StickyAddToCartBar,
} from "@/components/product-detail";
import { addToCart } from "@/lib/cart";
import { useProductEvents } from "@/hooks/useProductEvents";

interface ProductDetailPageProps {
  product: NormalizedProductDetail;
  relatedSections: Array<{ title: string; products: DisplayProduct[] }>;
  reviews?: ProductReview[];
}

export function ProductDetailPage({ product, relatedSections, reviews = [] }: ProductDetailPageProps) {
  const [selection, setSelection] = useState<VariantSelection>(product.defaultVariant);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<{ status: "success" | "error"; message: string } | null>(null);
  const hasSpecsContent = Boolean(
    product.specs.length ||
      product.materials.length ||
      product.dimensions ||
      product.weight ||
      product.careInstructions.length,
  );

  const { trackAddToCart, trackClickthrough, trackVariantChange } = useProductEvents({
    productId: product.id,
    initialVariant: product.defaultVariant,
  });

  const handleVariantChange = (key: keyof VariantSelection, value: string) => {
    setSelection((prev) => {
      if (prev[key] === value) {
        return prev;
      }
      const next = { ...prev, [key]: value };
      trackVariantChange(next);
      return next;
    });
  };

  const handleAddToCart = async () => {
    if (isAdding || !product.isInStock) {
      return;
    }
    setIsAdding(true);
    setFeedback(null);
    try {
      await addToCart({ productId: product.id, quantity, metadata: selection });
      trackAddToCart(quantity, selection);
      setFeedback({ status: "success", message: "Added to cart" });
    } catch (error) {
      console.error("Failed to add to cart", error);
      setFeedback({ status: "error", message: "Unable to add to cart. Please try again." });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRelatedClick = (productId: number, position: number, sectionTitle: string) => {
    trackClickthrough(productId, { position, section: sectionTitle });
  };

  return (
    <div className="space-y-12 pb-28 lg:pb-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <ProductImagesCarousel images={product.gallery} title={product.name} />
        <ProductInfoSection
          product={product}
          selection={selection}
          onVariantChange={handleVariantChange}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
          isAdding={isAdding}
          feedback={feedback}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProductDescription description={product.description} details={product.details} />
        </div>
        {hasSpecsContent && (
          <div>
            <ProductSpecifications
              specs={product.specs}
              materials={product.materials}
              dimensions={product.dimensions}
              weight={product.weight}
              careInstructions={product.careInstructions}
            />
          </div>
        )}
      </div>

      <ProductReviewsSection reviews={reviews} />

      <RelatedProductsSection sections={relatedSections} onProductClick={handleRelatedClick} />

      <StickyAddToCartBar product={product} quantity={quantity} isAdding={isAdding} onAddToCart={handleAddToCart} />
    </div>
  );
}
