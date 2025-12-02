"use client";

import { useCallback, useEffect, useRef } from "react";
import { sendAnalyticsEvent } from "@/lib/analytics";
import type { VariantSelection } from "@/utils/product-detail";

interface UseProductEventsOptions {
  productId: number;
  pagePath?: string;
  initialVariant?: VariantSelection;
  referrer?: string;
}

interface ProductEventApi {
  trackClickthrough: (relatedProductId: number, metadata?: Record<string, unknown>) => void;
  trackAddToCart: (quantity: number, variant?: VariantSelection) => void;
  trackVariantChange: (variant: VariantSelection) => void;
}

export function useProductEvents({ productId, pagePath, initialVariant, referrer }: UseProductEventsOptions): ProductEventApi {
  const productIdStr = String(productId);
  const metadataRef = useRef<{ referrer?: string; variant?: VariantSelection }>({
    referrer,
    variant: initialVariant,
  });

  useEffect(() => {
    metadataRef.current = { referrer, variant: initialVariant };
  }, [initialVariant, referrer]);

  useEffect(() => {
    const metadata = metadataRef.current.variant || metadataRef.current.referrer
      ? { variant: metadataRef.current.variant, referrer: metadataRef.current.referrer }
      : undefined;

    sendAnalyticsEvent({
      eventType: "view_product",
      entityId: productIdStr,
      metadata,
    });
    sendAnalyticsEvent({
      eventType: "page_view",
      entityId: pagePath ?? `/products/${productIdStr}`,
      metadata,
    });

    const dwellTimer = setTimeout(() => {
      sendAnalyticsEvent({
        eventType: "dwell_time",
        entityId: productIdStr,
        metadata: { seconds: 5, ...(metadata ?? {}) },
      });
    }, 5000);

    return () => clearTimeout(dwellTimer);
  }, [pagePath, productIdStr]);

  useEffect(() => {
    let sent = false;
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleScroll = () => {
      if (sent) return;
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      if (progress >= 0.6) {
        sent = true;
        sendAnalyticsEvent({
          eventType: "scroll_depth",
          entityId: productIdStr,
          metadata: { depth: 60 },
        });
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [productIdStr]);

  const trackClickthrough = useCallback(
    (relatedProductId: number, metadata?: Record<string, unknown>) => {
      sendAnalyticsEvent({
        eventType: "clickthrough",
        entityId: String(relatedProductId),
        metadata: {
          fromProduct: productIdStr,
          ...metadata,
        },
      });
    },
    [productIdStr],
  );

  const trackAddToCart = useCallback(
    (quantity: number, variant?: VariantSelection) => {
      sendAnalyticsEvent({
        eventType: "add_to_cart",
        entityId: productIdStr,
        metadata: {
          quantity,
          variant,
        },
      });
    },
    [productIdStr],
  );

  const trackVariantChange = useCallback((variant: VariantSelection) => {
    metadataRef.current.variant = variant;
    sendAnalyticsEvent({
      eventType: "variant_change",
      entityId: productIdStr,
      metadata: variant,
    });
  }, [productIdStr]);

  return {
    trackClickthrough,
    trackAddToCart,
    trackVariantChange,
  };
}
