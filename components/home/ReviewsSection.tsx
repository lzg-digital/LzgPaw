import type { Review } from '@/types';
import { StarRating } from '@/components/ui/StarRating';
import { formatDate } from '@/lib/utils';

interface ReviewsSectionProps {
  reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  return (
    <section className="container-content py-16 sm:py-20">
      <h2 className="text-center font-serif text-3xl text-ink sm:text-4xl">What pet owners say</h2>

      {reviews.length === 0 ? (
        <p className="mt-10 text-center text-ink/60">Real customer reviews coming soon.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl bg-white/70 p-6">
              <StarRating average={review.rating} count={1} />
              <p className="mt-3 text-sm text-ink/80">{review.review_text}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-ink/50">
                <span className="font-medium text-ink/70">
                  {review.customer_name}
                  {review.verified_purchase && <span className="ml-1.5 text-forest">· Verified Purchase</span>}
                </span>
                <span>{formatDate(review.created_at)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
