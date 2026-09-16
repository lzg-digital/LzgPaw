import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/data/settings';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  alternates: { canonical: '/legal/terms' },
};

export default async function TermsPage() {
  const settings = await getSiteSettings();
  const supportEmail = settings.support_email || '[support email]';

  return (
    <div className="container-content max-w-3xl py-14">
      <h1 className="font-serif text-3xl text-ink">Terms & Conditions</h1>
      <p className="mt-2 text-sm text-ink/50">Last updated: [date] — have this reviewed by a lawyer before publishing.</p>

      <Section title="Overview">
        <p>
          These Terms govern your use of this website and any purchase made through it, operated by LzgPaw
          ("we", "us"). By using this site or placing an order, you agree to these Terms.
        </p>
      </Section>

      <Section title="Orders & pricing">
        <p>
          All prices are shown in the currency displayed at checkout. We reserve the right to correct pricing errors
          and to cancel an order affected by one, in which case you'll be fully refunded. We may limit order
          quantities at our discretion.
        </p>
      </Section>

      <Section title="Payment">
        <p>
          Payment is processed by DPO Pay by Network. Your order is confirmed only once payment has been verified — see our{' '}
          <a href="/legal/shipping-policy" className="underline">Shipping Policy</a> for what happens next.
        </p>
      </Section>

      <Section title="Shipping & returns">
        <p>
          See our <a href="/legal/shipping-policy" className="underline">Shipping Policy</a> and{' '}
          <a href="/legal/returns-policy" className="underline">Returns Policy</a> for full details.
        </p>
      </Section>

      <Section title="Product information">
        <p>
          We describe our products as accurately as we can. Colors may vary slightly depending on your screen.
          Reviews on this site are submitted by customers and moderated before publishing — we do not fabricate
          reviews, ratings, or testimonials.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>
          You agree not to misuse this site — including attempting to interfere with its security, submitting false
          information, or using it for any unlawful purpose.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          [This section needs jurisdiction-specific legal language — a lawyer should draft the limitation of
          liability and disclaimer clauses appropriate for the countries you sell into.]
        </p>
      </Section>

      <Section title="Governing law">
        <p>[State the governing law and jurisdiction for these Terms once finalized with legal counsel.]</p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these Terms? Email{' '}
          <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a>.
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
