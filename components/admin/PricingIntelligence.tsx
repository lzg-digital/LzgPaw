import { AlertTriangle } from 'lucide-react';
import { calculatePricing } from '@/lib/pricing';
import { formatPrice } from '@/lib/utils';

interface PricingIntelligenceProps {
  productCost: number;
  shippingCost: number;
  otherCost: number;
  sellingPrice: number;
}

/**
 * This panel only ever explains the selling price the admin typed in — it
 * has no control that changes `price`. See lib/pricing.ts for the
 * calculation and database/schema.sql for the DB-side generated columns
 * that guarantee this stays true even if this component is bypassed.
 */
export function PricingIntelligence({ productCost, shippingCost, otherCost, sellingPrice }: PricingIntelligenceProps) {
  const result = calculatePricing({ productCost, shippingCost, otherCost, sellingPrice });

  return (
    <div className="rounded-2xl border border-forest/15 bg-sage/30 p-5">
      <h3 className="font-serif text-lg text-ink">Pricing Intelligence</h3>
      <p className="mt-1 text-xs text-ink/60">
        Calculated from the costs and selling price you enter below. This never changes your selling price — you're always in control of it.
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        <Metric label="Total Cost" value={formatPrice(result.totalCost)} />
        <Metric label="Est. Profit" value={formatPrice(result.estimatedProfit)} negative={result.estimatedProfit < 0} />
        <Metric
          label="Margin"
          value={result.profitMarginPct == null ? '—' : `${result.profitMarginPct}%`}
          negative={result.profitMarginPct != null && result.profitMarginPct < 0}
        />
      </dl>

      {result.warnings.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {result.warnings.map((w) => (
            <li
              key={w.message}
              className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                w.level === 'error' ? 'bg-red-50 text-red-700' : 'bg-clay/10 text-clay-700'
              }`}
            >
              <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              {w.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Metric({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-ink/50">{label}</dt>
      <dd className={`mt-0.5 font-serif text-lg ${negative ? 'text-red-600' : 'text-ink'}`}>{value}</dd>
    </div>
  );
}
