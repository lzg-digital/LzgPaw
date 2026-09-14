import Link from 'next/link';
import type { SiteSettings } from '@/types';

interface FooterProps {
  settings: SiteSettings;
}

const SHOP_LINKS = [
  { href: '/shop', label: 'All Products' },
  { href: '/shop?sort=featured', label: 'Best Sellers' },
  { href: '/#bundles', label: 'Bundles & Save' },
];

const SUPPORT_LINKS = [
  { href: '/legal/shipping-policy', label: 'Shipping' },
  { href: '/legal/returns-policy', label: 'Returns' },
  { href: '/contact', label: 'Contact' },
];

const LEGAL_LINKS = [
  { href: '/legal/privacy-policy', label: 'Privacy Policy' },
  { href: '/legal/terms', label: 'Terms & Conditions' },
];

export function Footer({ settings }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-forest-100 bg-forest text-cream">
      <div className="container-content grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="font-serif text-2xl font-semibold">LzgPaw</span>
          <p className="mt-3 max-w-xs text-sm text-cream/70">
            Simple, reusable pet-care tools designed for the everyday mess of loving a pet.
          </p>
          {settings.social_links.length > 0 && (
            <ul className="mt-5 flex gap-4">
              {settings.social_links.map((s) => (
                <li key={s.platform}>
                  <a href={s.url} className="text-sm text-cream/70 underline-offset-2 hover:text-cream hover:underline">
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <FooterColumn title="Shop" links={SHOP_LINKS} />
        <FooterColumn title="Customer Care" links={SUPPORT_LINKS} />
        <FooterColumn title="Legal" links={LEGAL_LINKS} />
      </div>

      <div className="border-t border-cream/10">
        <div className="container-content flex flex-col gap-2 py-6 text-xs text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} LzgPaw. All rights reserved.</p>
          {settings.support_email && (
            <a href={`mailto:${settings.support_email}`} className="hover:text-cream">
              {settings.support_email}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-cream/90">{title}</h3>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-cream/70 transition hover:text-cream">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
