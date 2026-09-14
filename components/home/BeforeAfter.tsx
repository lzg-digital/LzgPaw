import Image from 'next/image';
import type { Product } from '@/types';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';

interface BeforeAfterProps {
  product: Product | null;
}

export function BeforeAfter({ product }: BeforeAfterProps) {
  const before = product?.images?.find((i) => i.type === 'before');
  const after = product?.images?.find((i) => i.type === 'after');

  return (
    <section className="bg-sage/40 py-16 sm:py-20">
      <div className="container-content">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-serif text-3xl text-ink sm:text-4xl">See the difference</h2>
          <p className="mt-3 text-ink/70">
            Furniture covered in pet hair, cleared off in one pass — no lint rollers, no vacuum attachments.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:gap-6">
          <figure className="overflow-hidden rounded-xl2">
            <div className="relative aspect-[4/3] bg-cream">
              {before ? (
                <Image src={before.url} alt={before.alt_text || 'Before using LzgPaw'} fill className="object-cover" />
              ) : (
                <MediaPlaceholder label="Before photo — add in Admin" />
              )}
            </div>
            <figcaption className="bg-forest py-2 text-center text-sm font-medium text-cream">Before</figcaption>
          </figure>

          <figure className="overflow-hidden rounded-xl2">
            <div className="relative aspect-[4/3] bg-cream">
              {after ? (
                <Image src={after.url} alt={after.alt_text || 'After using LzgPaw'} fill className="object-cover" />
              ) : (
                <MediaPlaceholder label="After photo — add in Admin" />
              )}
            </div>
            <figcaption className="bg-clay py-2 text-center text-sm font-medium text-white">After</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
