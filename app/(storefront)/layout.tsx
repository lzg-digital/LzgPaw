import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { CartProvider } from '@/lib/cart-context';
import { getSiteSettings } from '@/lib/data/settings';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <CartProvider>
      <PageViewTracker />
      <AnnouncementBar text={settings.announcement_bar_text} />
      <Header />
      <main>{children}</main>
      <Footer settings={settings} />
      <CartDrawer />
      <CookieConsent />
    </CartProvider>
  );
}
