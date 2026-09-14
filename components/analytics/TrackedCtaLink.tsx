'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

interface TrackedCtaLinkProps {
  href: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}

export function TrackedCtaLink({ href, label, className, children }: TrackedCtaLinkProps) {
  return (
    <Link href={href} className={className} onClick={() => trackEvent('cta_click', { metadata: { label } })}>
      {children}
    </Link>
  );
}
