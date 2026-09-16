import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/data/settings';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  alternates: { canonical: '/legal/privacy-policy' },
};

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const supportEmail = settings.support_email || 'Ricopack0117@gmail.com';

  return (
    <div className="container-content max-w-3xl py-14 prose-legal">
      <h1 className="font-serif text-3xl text-ink">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink/50">Last updated: September 16, 2026.</p>

      <Section title="Who we are">
        <p>
          LzgPaw ("we", "us", "our") operates this website. For any privacy question or request, contact us at{' '}
          <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a>.
        </p>
        <p className="mt-2 text-ink/60">
          LzgPaw is currently operated as an unregistered online brand. We do not describe LzgPaw as a registered company or business. For privacy questions, contact Ricopack0117@gmail.com.
        </p>
      </Section>

      <Section title="What we collect">
        <ul className="list-disc pl-5">
          <li>Order information: name, email, phone, shipping/billing address, and what you purchased — collected when you check out.</li>
          <li>Account information, if you create one.</li>
          <li>Anonymous usage analytics (page views, add-to-cart, purchases) — only after you accept analytics cookies. See "Cookies" below.</li>
          <li>Payment is processed through DPO Pay by Network on its hosted payment environment; LzgPaw does not receive or store full card numbers.</li>
        </ul>
      </Section>

      <Section title="How we use it">
        <ul className="list-disc pl-5">
          <li>To fulfill and ship your order, and communicate with you about it.</li>
          <li>To provide customer support.</li>
          <li>To improve the site, only using analytics you've consented to.</li>
          <li>To comply with legal obligations (e.g. tax and accounting records).</li>
        </ul>
      </Section>

      <Section title="Who we share it with">
        <p>We share personal data only with the service providers needed to run this store:</p>
        <ul className="list-disc pl-5">
          <li><strong>Supabase</strong> — database and file storage.</li>
          <li><strong>Vercel</strong> — website hosting.</li>
          <li><strong>DPO Pay by Network</strong> — payment processing.</li>
          <li>Shipping carriers, to deliver your order.</li>
        </ul>
        <p className="mt-2">We do not sell personal data.</p>
      </Section>

      <Section title="Cookies">
        <p>
          We use strictly necessary cookies to run the site (like your cart), and optional analytics cookies only if
          you accept them via the cookie banner. You can change your choice at any time by clearing your cookies and
          revisiting the site.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          Depending on where you live, you may have the right to access, correct, delete, or export your personal
          data, and to object to or restrict certain processing. To exercise any of these rights, email{' '}
          <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a>.
        </p>
      </Section>

      <Section title="Data retention">
        <p>
          We keep order records as long as needed for accounting, tax, and legal purposes, and delete or anonymize
          other personal data when it's no longer needed for the purpose it was collected for.
        </p>
      </Section>

      <Section title="International transfers">
        <p>
          Our service providers may process data in countries other than your own. The exact locations depend on the regions selected for our hosting and database services. Where required, we use appropriate safeguards for international data transfers.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>We'll update the date at the top of this page when this policy changes.</p>
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
