import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/data/settings';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  alternates: { canonical: '/legal/terms' },
};

export default async function TermsPage() {
  const settings = await getSiteSettings();
  const supportEmail = settings.support_email || 'Ricopack0117@gmail.com';

  return (
    <div className="container-content max-w-3xl py-14">
      <h1 className="font-serif text-3xl text-ink">Terms & Conditions</h1>
      <p className="mt-2 text-sm text-ink/50">Last updated: September 16, 2026.</p>

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
          Payment is processed by DPO Pay by Network on its hosted payment environment. Your order is confirmed only once payment has been verified — see our{' '}
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
          Nothing in these Terms excludes or limits a right, remedy, warranty, or liability that cannot lawfully be excluded or limited. To the extent permitted by applicable law, LzgPaw is responsible only for losses directly caused by its breach of these Terms.
        </p>
      </Section>

      <Section title="Governing law">
        <p>These Terms are governed by the mandatory consumer and commercial laws that apply to your purchase and use of the site. Any specific governing-law and jurisdiction clause will be added when the store establishes its applicable legal entity and launch markets.</p>
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
