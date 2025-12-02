import type { Category } from "@/types/api";
import { CategoryCard } from "./CategoryCard";

interface CategorySectionProps {
  categories: Category[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  if (!categories.length) {
    return null;
  }

  return (
    <section aria-labelledby="category-heading" className="mb-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">Shop by category</p>
          <h2 id="category-heading" className="text-2xl font-semibold text-zinc-900">
            Top-level categories
          </h2>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
