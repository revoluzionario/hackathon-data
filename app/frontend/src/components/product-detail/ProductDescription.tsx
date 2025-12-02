interface ProductDescriptionProps {
  description?: string;
  details?: string[];
}

export function ProductDescription({ description, details }: ProductDescriptionProps) {
  if (!description && !details?.length) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-lg font-semibold text-emerald-600">Product details</p>
          <p className="text-2xl font-semibold text-zinc-900">What makes it special</p>
        </div>
        {description && <p className="text-base leading-relaxed text-zinc-600">{description}</p>}
        {details?.length ? (
          <ul className="grid gap-3 text-sm text-zinc-700">
            {details.map((detail) => (
              <li key={detail} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
