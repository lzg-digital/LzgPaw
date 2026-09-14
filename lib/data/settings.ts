import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { SiteSettings } from '@/types';

/**
 * Defaults are intentionally empty/off, not filled with plausible-sounding
 * claims — a trust badge or announcement that hasn't been configured by the
 * admin should not silently invent one (section 5 of the build spec: "Only
 * display claims that are actually supported by the business
 * configuration"). Components reading these must treat an empty value as
 * "don't render this," not "use a fallback string."
 */
const DEFAULTS: SiteSettings = {
  announcement_bar_text: '',
  trust_items: [],
  free_shipping_threshold: null,
  shipping_flat_rate: 0,
  return_window_days: null,
  support_email: process.env.SUPPORT_EMAIL ?? '',
  social_links: [],
};

/** Wrapped in React's `cache()` so the layout, homepage, and footer can each
 * call this within one request without issuing three separate queries. */
export const getSiteSettings = cache(async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createClient();
  const { data, error } = await supabase.from('site_settings').select('key, value');

  if (error || !data) {
    if (error) console.error('[getSiteSettings]', error.message);
    return DEFAULTS;
  }

  const map = new Map(data.map((row) => [row.key, row.value]));
  return {
    announcement_bar_text: (map.get('announcement_bar_text') as string) ?? DEFAULTS.announcement_bar_text,
    trust_items: (map.get('trust_items') as SiteSettings['trust_items']) ?? DEFAULTS.trust_items,
    free_shipping_threshold:
      (map.get('free_shipping_threshold') as number | null) ?? DEFAULTS.free_shipping_threshold,
    shipping_flat_rate: (map.get('shipping_flat_rate') as number) ?? DEFAULTS.shipping_flat_rate,
    return_window_days: (map.get('return_window_days') as number | null) ?? DEFAULTS.return_window_days,
    support_email: (map.get('support_email') as string) ?? DEFAULTS.support_email,
    social_links: (map.get('social_links') as SiteSettings['social_links']) ?? DEFAULTS.social_links,
  };
});
