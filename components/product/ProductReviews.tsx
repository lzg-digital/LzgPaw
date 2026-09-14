import type { Review } from '@/types';
import { StarRating } from '@/components/ui/StarRating';
import { formatDate } from '@/lib/utils';
import { ReviewForm } from '@/components/product/ReviewForm';

export function ProductReviews({ productId, reviews }: { productId: string; reviews: Review[] }) {
  return (
    <section className="container-content grid gap-10 py-16 lg:grid-cols-[1fr_360px]">
      <div>
        <h2 className="mb-6 font-serif text-2xl text-ink sm:text-3xl">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-ink/60">Real customer reviews coming soon.</p>
        ) : (
          <ul className="flex flex-col gap-6">
            {reviews.map((review) => (
              <li key={review.id} className="border-b border-forest-100 pb-6">
                <StarRating average={review.rating} count={1} />
                <p className="mt-2 text-sm text-ink/80">{review.review_text}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-ink/50">
                  <span className="font-medium text-ink/70">{review.customer_name}</span>
                  {review.verified_purchase && <span className="text-forest">Verified Purchase</span>}
                  <span>· {formatDate(review.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ReviewForm productId={productId} />
    </section>
  );
}
