"use client";

interface VariantSelectorProps {
  label: string;
  options: string[];
  value?: string;
  onSelect: (option: string) => void;
}

export function VariantSelector({ label, options, value, onSelect }: VariantSelectorProps) {
  if (!options.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = option === value;
          return (
            <button
              type="button"
              key={option}
              onClick={() => onSelect(option)}
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-zinc-200 text-zinc-700 hover:border-emerald-500 hover:text-emerald-600"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
