import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { getProductBySlug, getRelatedProducts } from '@/lib/data/products';
import { getApprovedReviews } from '@/lib/data/reviews';
import { getBundlesForProduct } from '@/lib/data/bundles';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductPurchasePanel } from '@/components/product/ProductPurchasePanel';
import { ProductTabs } from '@/components/product/ProductTabs';
import { ProductReviews } from '@/components/product/ProductReviews';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { BundleOffer } from '@/components/product/BundleOffer';
import { StarRating } from '@/components/ui/StarRating';
import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { ProductViewTracker } from '@/components/analytics/ProductViewTracker';

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};

  const title = product.seo_title || product.name;
  const description = product.seo_description || product.short_description || undefined;
  const image = product.images?.[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title, description, images: image ? [image] : undefined, type: 'website' },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lzgpaw.com';
  const [reviews, related, bundles] = await Promise.all([
    getApprovedReviews(product.id),
    getRelatedProducts(product),
    getBundlesForProduct(product.id),
  ]);

  return (
    <>
      <ProductJsonLd product={product} url={`${siteUrl}/product/${product.slug}`} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Shop', url: `${siteUrl}/shop` },
          { name: product.name, url: `${siteUrl}/product/${product.slug}` },
        ]}
      />
      <ProductViewTracker productId={product.id} />

      <div className="container-content pb-24 pt-8 sm:pb-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images ?? []} productName={product.name} />

          <div>
            <h1 className="font-serif text-3xl text-ink sm:text-4xl">{product.name}</h1>
            <div className="mt-2">
              <StarRating average={product.rating_average} count={product.rating_count} />
            </div>

            {product.short_description && <p className="mt-4 text-ink/75">{product.short_description}</p>}

            <div className="mt-6">
              <ProductPurchasePanel product={product} />
            </div>

            {product.benefits.length > 0 && (
              <ul className="mt-6 grid grid-cols-2 gap-2">
                {product.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-ink/75">
                    <Check size={16} className="mt-0.5 shrink-0 text-forest" aria-hidden="true" />
                    {benefit}
                  </li>
                ))}
              </ul>
            )}

            {bundles.length > 0 && (
              <div className="mt-6">
                <BundleOffer bundles={bundles} />
              </div>
            )}

            <div className="mt-8">
              <ProductTabs product={product} />
            </div>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} reviews={reviews} />
      <RelatedProducts products={related} />
    </>
  );
}
