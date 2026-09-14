import Image from 'next/image';
import type { Product } from '@/types';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { TrackedCtaLink } from '@/components/analytics/TrackedCtaLink';

interface HeroProps {
  heroProduct: Product | null;
}

export function Hero({ heroProduct }: HeroProps) {
  const image = heroProduct?.images?.find((i) => i.type === 'lifestyle') ?? heroProduct?.images?.[0];

  return (
    <section className="bg-cream">
      <div className="container-content grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="order-2 lg:order-1">
          <h1 className="text-balance font-serif text-4xl leading-[1.1] text-ink sm:text-5xl lg:text-[3.4rem]">
            Love your pet.
            <br />
            Not the fur.
          </h1>
          <p className="mt-5 max-w-md text-balance text-base text-ink/70 sm:text-lg">
            Pet hair on the sofa, the car seat, the sweater you just put on — it never really stops.
            LzgPaw's reusable roller lifts it off in seconds, no batteries, no lint sheets, no fuss.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <TrackedCtaLink
              href="/shop?sort=featured"
              label="shop_best_sellers"
              className="rounded-full bg-clay px-7 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-clay-600"
            >
              SHOP BEST SELLERS
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/shop"
              label="explore_products"
              className="rounded-full border border-forest/30 px-7 py-3.5 text-sm font-semibold tracking-wide text-forest transition hover:bg-sage"
            >
              EXPLORE PRODUCTS
            </TrackedCtaLink>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl2 bg-sage sm:aspect-[5/4] lg:aspect-[4/5]">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt_text || heroProduct?.name || 'LzgPaw pet hair remover'}
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
              />
            ) : (
              <MediaPlaceholder label="Hero product photo — add in Admin → Products" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
