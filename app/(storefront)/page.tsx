import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { TrustStrip } from '@/components/home/TrustStrip';
import { BestSellers } from '@/components/home/BestSellers';
import { BeforeAfter } from '@/components/home/BeforeAfter';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Bundles } from '@/components/home/Bundles';
import { WhyLzgPaw } from '@/components/home/WhyLzgPaw';
import { ProductShowcase } from '@/components/home/ProductShowcase';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd';
import { getFeaturedProducts } from '@/lib/data/products';
import { getActiveBundles } from '@/lib/data/bundles';
import { getRecentApprovedReviews } from '@/lib/data/reviews';
import { getSiteSettings } from '@/lib/data/settings';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export const revalidate = 60; // storefront data changes via admin, not every request

export default async function HomePage() {
  const [featuredProducts, bundles, reviews, settings] = await Promise.all([
    getFeaturedProducts(4),
    getActiveBundles(),
    getRecentApprovedReviews(6),
    getSiteSettings(),
  ]);

  const heroProduct = featuredProducts[0] ?? null;

  return (
    <>
      <OrganizationJsonLd />
      <Hero heroProduct={heroProduct} />
      <TrustStrip items={settings.trust_items} />
      <BestSellers products={featuredProducts} />
      <BeforeAfter product={heroProduct} />
      <HowItWorks />
      <Bundles bundles={bundles} />
      <WhyLzgPaw benefits={heroProduct?.benefits ?? []} />
      <ProductShowcase product={heroProduct} />
      <ReviewsSection reviews={reviews} />
    </>
  );
}
