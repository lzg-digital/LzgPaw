'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
] as const;

export function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('sort') ?? 'featured';

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-ink/70">
      Sort by
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-forest/20 bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-forest"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
