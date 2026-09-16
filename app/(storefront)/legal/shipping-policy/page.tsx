import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/data/settings';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Shipping Policy',
  alternates: { canonical: '/legal/shipping-policy' },
};

export default async function ShippingPolicyPage() {
  const settings = await getSiteSettings();
  const supportEmail = settings.support_email || 'Ricopack0117@gmail.com';

  return (
    <div className="container-content max-w-3xl py-14">
      <h1 className="font-serif text-3xl text-ink">Shipping Policy</h1>

      <Section title="Shipping rates">
        <p>
          Shipping is calculated at checkout.{' '}
          {settings.shipping_flat_rate > 0 && <>Standard shipping is {formatPrice(settings.shipping_flat_rate)}. </>}
          {settings.free_shipping_threshold != null && (
            <>Orders over {formatPrice(settings.free_shipping_threshold)} ship free. </>
          )}
        </p>
      </Section>

      <Section title="Processing & delivery times">
        <p>Orders are processed after payment is successfully verified. Delivery timing depends on destination, carrier, inventory, and fulfillment conditions. Where an estimated delivery window is available, it will be communicated during or after checkout.</p>
      </Section>

      <Section title="International shipping & customs">
        <p>We may ship internationally. Import duties, customs charges, and destination taxes may apply depending on the destination and shipment terms. Any such charges that are not explicitly included at checkout may be collected by the relevant customs authority or carrier.</p>
      </Section>

      <Section title="Order tracking">
        <p>
          Once your order ships, you'll receive a tracking number by email. You can also see your order and
          fulfillment status on your order confirmation page.
        </p>
      </Section>

      <Section title="Questions">
        <p>
          Contact us at <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a>.
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
