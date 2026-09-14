import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Percentage saved between an original and a discounted price, rounded down. */
export function savingsPercent(original: number, discounted: number): number {
  if (!original || original <= discounted) return 0;
  return Math.floor(((original - discounted) / original) * 100);
}

export function savingsAmount(original: number, discounted: number): number {
  return Math.max(0, Number((original - discounted).toFixed(2)));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

/** Clamp a number between min and max (used for quantity steppers etc.). */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Escapes a value for safe embedding inside a raw PostgREST filter string —
 * i.e. anywhere a `.or()` / `.and()` call builds its filter by template
 * literal rather than through `.eq()`/`.ilike()`, which are parameterized
 * on their own. PostgREST's filter grammar treats `,`, `.`, `(`, and `)` as
 * syntax, so an unescaped value can change which condition the filter
 * actually expresses, not just what it matches — this wraps the value in
 * double quotes (PostgREST's own escape mechanism for embedded values) and
 * escapes any literal backslash/quote inside it.
 *
 * Always prefer chaining separate `.eq()`/`.ilike()` calls when possible;
 * reach for this only where a single `.or()`/`.and()` filter string is
 * unavoidable.
 */
export function escapePostgrestValue(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}
