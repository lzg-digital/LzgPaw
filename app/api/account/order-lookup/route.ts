import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { isRateLimited, recordHit, getClientIp } from '@/lib/rate-limit';

const schema = z.object({
  order_number: z.string().trim().min(1).max(30),
  email: z.string().trim().email(),
});

const BUCKET = 'order-lookup';
const MAX_ATTEMPTS = 10;
const WINDOW_MINUTES = 15;

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid order number and email.' }, { status: 400 });

  // SECURITY: order_number is sequential and low-entropy (LZG-1000,
  // LZG-1001, ...) — without this, someone who knows or guesses a target's
  // email could iterate order numbers to find and view their order
  // (shipping address, phone, total). Rate limiting is the primary control
  // here, not a nice-to-have.
  const ip = getClientIp(request);
  if (await isRateLimited(BUCKET, ip, MAX_ATTEMPTS, WINDOW_MINUTES)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }
  await recordHit(BUCKET, ip);

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('order_number', parsed.data.order_number.toUpperCase())
    .eq('customer_email', parsed.data.email.toLowerCase())
    .maybeSingle();

  if (!order) {
    // Deliberately generic — don't reveal whether the order number or the
    // email was the mismatch.
    return NextResponse.json({ error: "We couldn't find a matching order." }, { status: 404 });
  }

  return NextResponse.json({ id: order.id });
}
