interface ProductBadgeProps {
  label: string | null | undefined;
}

export function ProductBadge({ label }: ProductBadgeProps) {
  if (!label) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-forest px-3 py-1 text-[11px] font-semibold tracking-wide text-cream">
      {label}
    </span>
  );
}
