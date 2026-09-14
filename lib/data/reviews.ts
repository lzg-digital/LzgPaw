import { createClient } from '@/lib/supabase/server';
import type { Review } from '@/types';

export async function getApprovedReviews(productId: string, limit = 20): Promise<Review[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('id, product_id, customer_name, rating, review_text, photo_url, video_url, verified_purchase, status, created_at')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getApprovedReviews]', error.message);
    return [];
  }
  return data ?? [];
}

/** A small cross-product sample for homepage social proof — approved only,
 * and the caller must render the "coming soon" empty state when this
 * returns an empty array (see components/home/ReviewsSection.tsx). */
export async function getRecentApprovedReviews(limit = 6): Promise<Review[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('id, product_id, customer_name, rating, review_text, photo_url, video_url, verified_purchase, status, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getRecentApprovedReviews]', error.message);
    return [];
  }
  return data ?? [];
}
