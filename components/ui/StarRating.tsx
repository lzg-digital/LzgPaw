import { Star } from 'lucide-react';

interface StarRatingProps {
  average: number | null | undefined;
  count: number | undefined;
  size?: number;
}

/**
 * Renders nothing but a plain "No reviews yet" when count is 0 — never an
 * invented star rating (section 6/12 of the build spec).
 */
export function StarRating({ average, count, size = 14 }: StarRatingProps) {
  if (!count || !average) {
    return <span className="text-xs text-ink/50">No reviews yet</span>;
  }

  const rounded = Math.round(average * 2) / 2;

  return (
    <div className="flex items-center gap-1.5" aria-label={`Rated ${average} out of 5 from ${count} review${count === 1 ? '' : 's'}`}>
      <div className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= rounded;
          const half = !filled && i + 0.5 === rounded;
          return (
            <Star
              key={i}
              size={size}
              className={filled || half ? 'fill-clay text-clay' : 'text-forest/20'}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      <span className="text-xs text-ink/60">
        {average.toFixed(1)} ({count})
      </span>
    </div>
  );
}
