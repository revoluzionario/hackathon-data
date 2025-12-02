"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

interface ProductImagesCarouselProps {
  images: string[];
  title: string;
}

export function ProductImagesCarousel({ images, title }: ProductImagesCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const safeImages = images.length ? images : ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"];

  const setIndex = useCallback(
    (index: number) => {
      const next = (index + safeImages.length) % safeImages.length;
      setActiveIndex(next);
    },
    [safeImages.length],
  );

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(event.touches[0].clientX);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(event.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) {
      return;
    }
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 40) {
      setIndex(activeIndex + (distance > 0 ? 1 : -1));
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div>
      <div
        className="group relative aspect-square overflow-hidden rounded-3xl border border-zinc-100 bg-white"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          key={safeImages[activeIndex]}
          src={safeImages[activeIndex]}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {safeImages.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 lg:hidden">
            {safeImages.map((_, index) => (
              <span
                key={`dot-${index}`}
                className={`h-1.5 w-6 rounded-full ${index === activeIndex ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex(activeIndex - 1)}
              className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-zinc-700 shadow-lg backdrop-blur hover:bg-white lg:inline-flex"
              aria-label="Previous image"
            >
              {"<"}
            </button>
            <button
              type="button"
              onClick={() => setIndex(activeIndex + 1)}
              className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-zinc-700 shadow-lg backdrop-blur hover:bg-white lg:inline-flex"
              aria-label="Next image"
            >
              {">"}
            </button>
          </>
        )}
      </div>
      {safeImages.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {safeImages.map((image, index) => (
            <button
              type="button"
              key={image}
              onClick={() => setIndex(index)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border transition ${
                index === activeIndex ? "border-emerald-500" : "border-transparent"
              }`}
              aria-label={`Show image ${index + 1}`}
            >
              <Image src={image} alt="Product thumbnail" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
