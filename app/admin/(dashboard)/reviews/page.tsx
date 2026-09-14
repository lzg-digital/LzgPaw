import { createAdminClient } from '@/lib/supabase/admin';
import { ReviewModerationTable } from '@/components/admin/ReviewModerationTable';

export default async function AdminReviewsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('reviews')
    .select('id, customer_name, rating, review_text, status, verified_purchase, created_at, product:products(name)')
    .order('created_at', { ascending: false });

  const reviews = (data ?? []).map((r: any) => ({
    id: r.id,
    product_name: r.product?.name ?? 'Unknown product',
    customer_name: r.customer_name,
    rating: r.rating,
    review_text: r.review_text,
    status: r.status,
    verified_purchase: r.verified_purchase,
    created_at: r.created_at,
  }));

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-ink">Reviews</h1>
      <ReviewModerationTable reviews={reviews} />
    </div>
  );
}
