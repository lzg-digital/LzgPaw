import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaPlaceholderProps {
  label?: string;
  className?: string;
}

/**
 * Used anywhere a real product/lifestyle photo hasn't been uploaded yet.
 * Deliberately looks like an empty state, not a finished photo — the brief
 * is explicit that nothing on the storefront should be fabricated, and that
 * includes not dressing up missing photography as real content.
 */
export function MediaPlaceholder({ label, className }: MediaPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-sage to-cream text-forest/50',
        className
      )}
    >
      <PawPrint size={32} strokeWidth={1.5} aria-hidden="true" />
      {label && <span className="px-4 text-center text-xs text-forest/60">{label}</span>}
    </div>
  );
}
