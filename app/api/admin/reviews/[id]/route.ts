import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { reviewModerationSchema } from '@/lib/validation';

interface Params {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = reviewModerationSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

  const supabase = createAdminClient();

  const { data: review } = await supabase
    .from('reviews')
    .select('id, product_id, customer_email')
    .eq('id', params.id)
    .maybeSingle();

  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let verifiedPurchase: boolean | undefined;

  // "Verified Purchase" is only ever set here, server-side, by checking for
  // a real paid order that actually contains this product — never taken on
  // the reviewer's word (section 12 of the build spec).
  if (parsed.data.status === 'approved' && review.customer_email) {
    const { data: matchingOrder } = await supabase
      .from('orders')
      .select('id, order_items!inner(product_id)')
      .eq('customer_email', review.customer_email.toLowerCase())
      .eq('payment_status', 'paid')
      .eq('order_items.product_id', review.product_id)
      .limit(1)
      .maybeSingle();

    verifiedPurchase = !!matchingOrder;
  }

  const { error } = await supabase
    .from('reviews')
    .update({
      status: parsed.data.status,
      ...(verifiedPurchase !== undefined ? { verified_purchase: verifiedPurchase } : {}),
    })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, verified_purchase: verifiedPurchase });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { error } = await supabase.from('reviews').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
