import { NextRequest, NextResponse } from 'next/server';
import { reviewSubmissionSchema } from '@/lib/validation';
import { createClient } from '@/lib/supabase/server';
import { isRateLimited, recordHit, getClientIp } from '@/lib/rate-limit';

const BUCKET = 'review-submit';
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 60;

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = reviewSubmissionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check your review and try again.' }, { status: 400 });
  }

  // Reviews land as "pending" and still need a human to approve them, but
  // that doesn't make spam free to ignore — an unrated flood of pending
  // reviews is still a real moderation burden. Rate limit before it grows.
  const ip = getClientIp(request);
  if (await isRateLimited(BUCKET, ip, MAX_ATTEMPTS, WINDOW_MINUTES)) {
    return NextResponse.json({ error: 'Too many reviews submitted recently. Please try again later.' }, { status: 429 });
  }
  await recordHit(BUCKET, ip);

  const supabase = createClient();

  // RLS policy "public can submit a pending review" enforces status='pending'
  // and verified_purchase=false at the database level too — this is
  // belt-and-suspenders, not the only guard.
  const { error } = await supabase.from('reviews').insert({
    product_id: parsed.data.product_id,
    customer_name: parsed.data.customer_name,
    customer_email: parsed.data.customer_email ?? null,
    rating: parsed.data.rating,
    review_text: parsed.data.review_text,
    photo_url: parsed.data.photo_url ?? null,
    video_url: parsed.data.video_url ?? null,
    status: 'pending',
    verified_purchase: false,
  });

  if (error) {
    console.error('[reviews] insert failed', error.message);
    return NextResponse.json({ error: 'Could not submit review' }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, message: 'Thanks! Your review will appear once it has been reviewed by our team.' },
    { status: 201 }
  );
}
