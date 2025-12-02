import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types/api";

interface CategoryCardProps {
  category: Category;
}

const fallbackImage = (category: Category) =>
  `https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80&sat=-100&blend=111827&blend-mode=multiply&sig=${category.id}`;

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.id}`}
      className="group relative flex h-48 flex-col overflow-hidden rounded-2xl bg-zinc-100 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <Image
        src={fallbackImage(category)}
        alt={category.name}
        fill
        className="object-cover object-center transition duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="relative z-10 mt-auto flex flex-col gap-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 text-white">
        <h3 className="text-lg font-semibold">{category.name}</h3>
        <span className="inline-flex w-max items-center gap-1 text-sm text-white/80">
          Shop now
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
