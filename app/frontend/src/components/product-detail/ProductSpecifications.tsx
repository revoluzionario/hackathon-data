import type { ProductSpecificationItem } from "@/utils/product-detail";

interface ProductSpecificationsProps {
  specs: ProductSpecificationItem[];
  materials?: string[];
  dimensions?: string;
  weight?: string;
  careInstructions?: string[];
}

export function ProductSpecifications({ specs, materials, dimensions, weight, careInstructions }: ProductSpecificationsProps) {
  if (!specs.length && !materials?.length && !dimensions && !weight && !careInstructions?.length) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-lg font-semibold text-emerald-600">Specifications</p>
        <p className="text-2xl font-semibold text-zinc-900">Craftsmanship & care</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {specs.map((spec) => (
          <div key={spec.label} className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-500">{spec.label}</p>
            <p className="text-base font-semibold text-zinc-900">{spec.value}</p>
          </div>
        ))}
        {materials?.length ? (
          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-500">Materials</p>
            <p className="text-base font-semibold text-zinc-900">{materials.join(", ")}</p>
          </div>
        ) : null}
        {dimensions && (
          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-500">Dimensions</p>
            <p className="text-base font-semibold text-zinc-900">{dimensions}</p>
          </div>
        )}
        {weight && (
          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-500">Weight</p>
            <p className="text-base font-semibold text-zinc-900">{weight}</p>
          </div>
        )}
        {careInstructions?.length ? (
          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-500">Care instructions</p>
            <ul className="mt-2 list-disc pl-4 text-sm text-zinc-700">
              {careInstructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
