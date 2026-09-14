import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { bundleInputSchema } from '@/lib/validation';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('bundles')
    .select('id, name, slug, badge, price, compare_at_price, active, position, items:bundle_items(id, product_id, quantity)')
    .order('position');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bundles: data });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bundleInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid bundle data' }, { status: 400 });
  }

  const { items, ...bundle } = parsed.data;
  const supabase = createAdminClient();

  const { data: created, error } = await supabase.from('bundles').insert(bundle).select('id').single();
  if (error || !created) return NextResponse.json({ error: error?.message ?? 'Could not create bundle' }, { status: 500 });

  await supabase.from('bundle_items').insert(items.map((i) => ({ ...i, bundle_id: created.id })));

  return NextResponse.json({ id: created.id }, { status: 201 });
}
