export function formatCurrency(value: number | string, currency = 'USD', locale = 'en-US') {
  const amount = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function truncate(text: string, max = 120) {
  if (!text) {
    return '';
  }
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max).trimEnd()}...`;
}

export function resolveImageFromAttributes(
  attributes: Record<string, unknown> | undefined,
  fallback: string,
) {
  if (!attributes) {
    return fallback;
  }
  const preferredKeys = ['image', 'imageUrl', 'thumbnail', 'hero', 'cover'];
  for (const key of preferredKeys) {
    const value = attributes[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return fallback;
}

export function formatDate(value?: string | Date | null, locale = 'en-US', options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return '';
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(options ?? {}),
  }).format(date);
}
