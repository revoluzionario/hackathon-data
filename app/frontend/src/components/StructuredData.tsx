import type { DisplayProduct } from "@/types/api";

interface StructuredDataProps {
  products: DisplayProduct[];
}

export function StructuredData({ products }: StructuredDataProps) {
  if (!products.length) {
    return null;
  }

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trending products",
    itemListElement: products.slice(0, 8).map((product, index) => ({
      "@type": "Product",
      position: index + 1,
      name: product.name,
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: product.price,
        availability: "https://schema.org/InStock",
      },
      sku: product.id,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
