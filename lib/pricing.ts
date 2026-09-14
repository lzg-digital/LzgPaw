/**
 * Pricing Intelligence
 *
 * These are pure, read-only calculations. Nothing in this file (or anywhere
 * that calls it) is allowed to change `price` — it only ever explains the
 * financial result of a price a human already typed in. The database
 * enforces the same math independently via generated columns
 * (see database/schema.sql `products.total_cost` / `estimated_profit` /
 * `profit_margin_pct`) so the admin UI and the stored truth can never drift
 * apart.
 */

export interface PricingInput {
  productCost: number;
  shippingCost: number;
  otherCost: number;
  sellingPrice: number;
}

export interface PricingResult {
  totalCost: number;
  estimatedProfit: number;
  /** null when sellingPrice is 0 — margin is undefined, not zero. */
  profitMarginPct: number | null;
  warnings: PricingWarning[];
}

export type PricingWarning =
  | { level: 'error'; message: string }
  | { level: 'warning'; message: string };

const LOW_MARGIN_THRESHOLD_PCT = 15;

export function calculatePricing(input: PricingInput): PricingResult {
  const productCost = Number.isFinite(input.productCost) ? input.productCost : 0;
  const shippingCost = Number.isFinite(input.shippingCost) ? input.shippingCost : 0;
  const otherCost = Number.isFinite(input.otherCost) ? input.otherCost : 0;
  const sellingPrice = Number.isFinite(input.sellingPrice) ? input.sellingPrice : 0;

  const totalCost = round2(productCost + shippingCost + otherCost);
  const estimatedProfit = round2(sellingPrice - totalCost);
  const profitMarginPct = sellingPrice > 0 ? round2((estimatedProfit / sellingPrice) * 100) : null;

  const warnings: PricingWarning[] = [];

  if (sellingPrice > 0 && sellingPrice < totalCost) {
    warnings.push({
      level: 'error',
      message: 'Selling price is below total cost — every sale currently loses money.',
    });
  } else if (estimatedProfit < 0) {
    warnings.push({ level: 'error', message: 'Estimated profit is negative.' });
  } else if (profitMarginPct !== null && profitMarginPct < LOW_MARGIN_THRESHOLD_PCT) {
    warnings.push({
      level: 'warning',
      message: `Profit margin is low (${profitMarginPct}%) — below the ${LOW_MARGIN_THRESHOLD_PCT}% comfort threshold.`,
    });
  }

  if (sellingPrice === 0) {
    warnings.push({ level: 'warning', message: 'Enter a selling price to see profit and margin.' });
  }

  return { totalCost, estimatedProfit, profitMarginPct, warnings };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
