import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { orderFulfillmentUpdateSchema } from '@/lib/validation';

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

  // Deliberately narrow: fulfillment_status + tracking only. There is no
  // field here for payment_status — that only ever changes via the
  // signature-verified webhook (see app/api/webhooks/paypesa/route.ts).
  // This isn't an oversight; an admin fat-fingering "paid" on an unpaid
  // order is exactly the failure mode section 17/20 of the build spec
  // guards against.
  const parsed = orderFulfillmentUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid update' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('orders').update(parsed.data).eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
