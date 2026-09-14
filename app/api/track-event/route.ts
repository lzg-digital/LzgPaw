import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// Kept in sync with the `event_type` values the storefront actually emits
// (lib/analytics.ts) and with docs/COMPLIANCE.md §5.
const EVENT_TYPES = [
  'page_view',
  'product_view',
  'add_to_cart',
  'begin_checkout',
  'purchase',
  'bundle_select',
  'cta_click',
] as const;

const bodySchema = z.object({
  event_type: z.enum(EVENT_TYPES),
  session_id: z.string().min(1).max(100),
  product_id: z.string().uuid().optional(),
  order_id: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
  }

  const supabase = createClient();

  // RLS policy "public can write analytics events" allows this insert for
  // the anon role and nothing else — see database/schema.sql.
  const { error } = await supabase.from('analytics_events').insert({
    event_type: parsed.data.event_type,
    session_id: parsed.data.session_id,
    product_id: parsed.data.product_id ?? null,
    order_id: parsed.data.order_id ?? null,
    metadata: parsed.data.metadata,
  });

  if (error) {
    // Never leak internal error detail to the client (section 37 — error handling).
    console.error('[track-event] insert failed', error.message);
    return NextResponse.json({ error: 'Could not record event' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
