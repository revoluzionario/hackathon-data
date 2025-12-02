"use client";

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function QuantitySelector({ value, min = 1, max = 10, onChange }: QuantitySelectorProps) {
  const clampValue = (next: number) => {
    const upperBound = Number.isFinite(max) ? max : next;
    const bounded = Math.min(Math.max(next, min), upperBound);
    onChange(bounded);
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-2">
      <button
        type="button"
        className="h-9 w-9 rounded-xl border border-zinc-200 text-lg font-semibold text-zinc-700 transition hover:border-emerald-500 hover:text-emerald-600"
        onClick={() => clampValue(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="w-8 text-center text-base font-medium text-zinc-900">{value}</span>
      <button
        type="button"
        className="h-9 w-9 rounded-xl border border-zinc-200 text-lg font-semibold text-zinc-700 transition hover:border-emerald-500 hover:text-emerald-600"
        onClick={() => clampValue(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
