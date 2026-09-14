import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/data/settings';

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  alternates: { canonical: '/legal/returns-policy' },
};

export default async function ReturnsPolicyPage() {
  const settings = await getSiteSettings();
  const supportEmail = settings.support_email || '[support email]';
  const windowDays = settings.return_window_days;

  return (
    <div className="container-content max-w-3xl py-14">
      <h1 className="font-serif text-3xl text-ink">Returns & Refunds</h1>

      <Section title="Return window">
        {windowDays != null ? (
          <p>You can request a return within {windowDays} days of delivery.</p>
        ) : (
          <p className="text-clay-700">
            [No return window has been configured yet — set "Return window (days)" in Admin → Settings. Note: EU
            customers have a legal 14-day right of withdrawal regardless of this setting — see
            docs/COMPLIANCE.md §3.]
          </p>
        )}
      </Section>

      <Section title="Eligibility">
        <p>
          [State your actual condition requirements — e.g. unused, original packaging — once decided. Be specific
          and don't promise more than you can honor.]
        </p>
      </Section>

      <Section title="How to start a return">
        <p>
          Email <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a> with your order number
          and the reason for your return, and we'll walk you through the next steps.
        </p>
      </Section>

      <Section title="Refunds">
        <p>
          Once your return is received and inspected, we'll notify you and process your refund to your original
          payment method. [State your actual refund timeline once confirmed with your payment provider's
          processing times.]
        </p>
      </Section>

      <Section title="Damaged or incorrect items">
        <p>
          If your order arrived damaged or incorrect, contact{' '}
          <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a> with photos and your order
          number as soon as possible.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-xl text-ink">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-ink/75">{children}</div>
    </section>
  );
}
