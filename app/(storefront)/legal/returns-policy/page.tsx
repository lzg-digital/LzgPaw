import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/data/settings';

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  alternates: { canonical: '/legal/returns-policy' },
};

export default async function ReturnsPolicyPage() {
  const settings = await getSiteSettings();
  const supportEmail = settings.support_email || 'Ricopack0117@gmail.com';
  const windowDays = settings.return_window_days;

  return (
    <div className="container-content max-w-3xl py-14">
      <h1 className="font-serif text-3xl text-ink">Returns & Refunds</h1>

      <Section title="Return window">
        {windowDays != null ? (
          <p>You can request a return within {windowDays} days of delivery.</p>
        ) : (
          <p>We have not published a fixed voluntary return window yet. Any mandatory return, cancellation, withdrawal, or refund rights that apply to your purchase under local law remain unaffected.</p>
        )}
      </Section>

      <Section title="Eligibility">
        <p>Items returned under an applicable legal or published return right should be in the condition required by that right. We may request reasonable evidence of the order and the condition of the item.</p>
      </Section>

      <Section title="How to start a return">
        <p>
          Email <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a> with your order number
          and the reason for your return, and we'll walk you through the next steps.
        </p>
      </Section>

      <Section title="Refunds">
        <p>Once an eligible return is received and reviewed, any approved refund will be sent to the original payment method where supported by the payment provider. Processing time can vary by provider and bank.</p>
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
