import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { getSiteSettings } from '@/lib/data/settings';

export const metadata: Metadata = {
  title: 'Contact',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const email = settings.support_email;

  return (
    <div className="container-content max-w-xl py-16 text-center">
      <h1 className="font-serif text-4xl text-ink">Get in touch</h1>
      <p className="mt-4 text-ink/70">
        Questions about an order, a product, or anything else — we're happy to help.
      </p>

      {email ? (
        <a
          href={`mailto:${email}`}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream transition hover:bg-forest-700"
        >
          <Mail size={16} aria-hidden="true" /> {email}
        </a>
      ) : (
        <p className="mt-8 text-sm text-ink/50">
          A support email hasn't been configured yet — set one in Admin → Settings.
        </p>
      )}

      {settings.social_links.length > 0 && (
        <div className="mt-8 flex justify-center gap-5">
          {settings.social_links.map((s) => (
            <a key={s.platform} href={s.url} className="text-sm font-medium text-forest underline underline-offset-2">
              {s.platform}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
