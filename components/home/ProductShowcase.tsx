import Image from 'next/image';
import type { Product, ProductImage } from '@/types';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { cn } from '@/lib/utils';

interface ProductShowcaseProps {
  product: Product | null;
}

interface Slide {
  label: string;
  heading: string;
  copy: string;
  imageType: ProductImage['type'];
}

const SLIDES: Slide[] = [
  {
    label: 'The problem',
    heading: 'Pet hair finds everything',
    copy: 'Sofas, bedding, car seats, the sweater you just put on — it collects faster than you can keep up with it.',
    imageType: 'lifestyle',
  },
  {
    label: 'The product',
    heading: 'One reusable roller, no batteries',
    copy: 'A simple mechanical design built to be picked up and used the moment you need it — no charging, no refills.',
    imageType: 'main',
  },
  {
    label: 'In use',
    heading: 'Made for everyday messes',
    copy: 'Roll it over any fabric surface — the motion pulls hair up and locks it inside the chamber.',
    imageType: 'usage',
  },
  {
    label: 'The result',
    heading: 'Clean surfaces, in minutes',
    copy: 'Empty the chamber, and it is ready to go again immediately.',
    imageType: 'after',
  },
];

export function ProductShowcase({ product }: ProductShowcaseProps) {
  return (
    <section className="bg-sage/30 py-16 sm:py-20">
      <div className="container-content flex flex-col gap-16">
        {SLIDES.map((slide, i) => {
          const image = product?.images?.find((img) => img.type === slide.imageType);
          const reversed = i % 2 === 1;

          return (
            <div
              key={slide.label}
              className={cn('grid items-center gap-8 lg:grid-cols-2 lg:gap-14', reversed && 'lg:[direction:rtl]')}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl2 bg-cream lg:[direction:ltr]">
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.alt_text || slide.heading}
                    fill
                    sizes="(min-width: 1024px) 45vw, 90vw"
                    className="object-cover"
                    loading="lazy"
                  />
                ) : (
                  <MediaPlaceholder label={`${slide.label} photo — add in Admin`} />
                )}
              </div>
              <div className="lg:[direction:ltr]">
                <span className="text-sm font-medium text-forest/70">{slide.label}</span>
                <h3 className="mt-2 font-serif text-2xl text-ink sm:text-3xl">{slide.heading}</h3>
                <p className="mt-3 max-w-md text-ink/70">{slide.copy}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
