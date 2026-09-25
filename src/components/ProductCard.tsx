import React from 'react';
import { Star, Plus, Check } from 'lucide-react';
import { Product } from '../types/store';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelectProduct,
}) => {
  const [added, setAdded] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const discountPercent = product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
    >
      {/* Product Image Box */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Elegant fallback if image fails
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Discount Tag (Clean Minimal Unboxed Overprint) */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-stone-900 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-sm">
            Save {discountPercent}%
          </div>
        )}

        {/* Multi-Item Bundle Eligible Marker */}
        {product.isBundleEligible && (
          <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-xs text-stone-950 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
            Save on 2+
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata: Category & In-Stock */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5 font-medium">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.inStock ? `${product.stockCount} in stock` : 'Out of Stock'}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-stone-900 text-base leading-snug line-clamp-2 group-hover:text-amber-900 transition-colors">
            {product.name}
          </h3>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-stone-600">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-semibold text-stone-800">{product.rating.toFixed(1)}</span>
            <span className="text-stone-400">({product.reviewsCount} reviews)</span>
          </div>
        </div>

        {/* Price & Action Section */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-stone-900 font-mono tabular-nums">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice > product.price && (
                <span className="text-xs text-stone-400 line-through font-mono tabular-nums">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium block">
              Free Delivery Included
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-900 text-white hover:bg-stone-800 active:scale-95'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
