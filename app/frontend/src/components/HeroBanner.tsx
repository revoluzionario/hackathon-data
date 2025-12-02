import Link from "next/link";
import Image from "next/image";

interface HeroBannerProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaHref: string;
}

export function HeroBanner({ title, subtitle, imageUrl, ctaText, ctaHref }: HeroBannerProps) {
  return (
    <section className="relative isolate mb-16 h-[70vh] overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600/90 to-sky-700/80 text-white shadow-2xl">
      <Image
        src={imageUrl}
        alt="Featured hero"
        fill
        priority
        className="object-cover object-center opacity-60"
      />
      <div className="relative z-10 flex h-full flex-col items-start justify-center gap-6 px-8 py-10 sm:px-16">
        <p className="rounded-full border border-white/40 px-3 py-1 text-xs uppercase tracking-[0.3em]">
          Data-first commerce
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="max-w-xl text-lg text-white/80 sm:text-xl">{subtitle}</p>
        <Link
          href={ctaHref}
          className="inline-flex items-center rounded-full bg-white px-6 py-3 text-base font-semibold text-emerald-700 shadow-lg shadow-emerald-900/40 transition hover:translate-y-0.5 hover:bg-emerald-50"
        >
          {ctaText}
        </Link>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_50%)]" />
    </section>
  );
}
