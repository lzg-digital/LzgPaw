import { safeJsonLd } from '@/lib/json-ld';

export function OrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lzgpaw.com';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LzgPaw',
    url: siteUrl,
    // No `logo` field yet — pointing this at a real, uploaded brand asset
    // once one exists is preferable to a placeholder URL that 404s.
    email: process.env.SUPPORT_EMAIL,
  };

  return (
    // eslint-disable-next-line react/no-danger
    <script type="application/ld+json" dangerouslySetInnerHTML={safeJsonLd(data)} />
  );
}
