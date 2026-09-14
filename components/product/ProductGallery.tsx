'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductImage } from '@/types';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex];

  if (sorted.length === 0) {
    return (
      <div className="aspect-square overflow-hidden rounded-2xl bg-sage">
        <MediaPlaceholder label="Product photos — add in Admin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-sage">
        <Image
          src={active.url}
          alt={active.alt_text || productName}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="object-cover"
        />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {sorted.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show image ${i + 1} of ${sorted.length}`}
              aria-current={i === activeIndex}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sage ring-offset-2 transition',
                i === activeIndex ? 'ring-2 ring-forest' : 'opacity-70 hover:opacity-100'
              )}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
