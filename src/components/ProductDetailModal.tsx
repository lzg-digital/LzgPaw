import React, { useState } from 'react';
import { X, Star, Check, ShieldCheck, Truck, RefreshCw, Gift, Heart } from 'lucide-react';
import { Product } from '../types/store';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const discountPercent = product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl my-8 border border-stone-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-stone-500 hover:text-stone-900 bg-white/80 hover:bg-white rounded-full transition-colors shadow-xs"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Gallery Showcase */}
          <div className="bg-stone-100 relative min-h-[300px] md:min-h-[460px] flex items-center justify-center overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/images/product_orthopedic_bed_1790283966759.jpg';
              }}
            />
            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-stone-900 text-white text-xs font-semibold px-3 py-1 rounded shadow-sm">
                Save {discountPercent}% Off Regular Price
              </div>
            )}
          </div>

          {/* Product Details & Purchase Module */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-5">
            <div>
              {/* Category & Status */}
              <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> In Stock ({product.stockCount} ready to dispatch)
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display text-2xl font-bold text-stone-900 mt-2 leading-tight">
                {product.name}
              </h2>

              {/* Ratings */}
              <div className="flex items-center gap-2 mt-2 text-xs text-stone-600">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-stone-900">{product.rating.toFixed(1)}</span>
                <span>({product.reviewsCount} customer reviews)</span>
              </div>

              {/* Price Calculation */}
              <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono tabular-nums text-stone-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compareAtPrice > product.price && (
                      <span className="text-sm text-stone-400 line-through font-mono tabular-nums">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-emerald-700 font-medium block mt-0.5">
                    Free Worldwide Delivery · No Extra Fees
                  </span>
                </div>
                {product.compareAtPrice > product.price && (
                  <div className="text-right">
                    <span className="text-xs font-semibold text-amber-900 bg-amber-100/70 px-2 py-1 rounded">
                      You save ${(product.compareAtPrice - product.price).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>

              {/* Special Bundle Promo Notification */}
              {product.isBundleEligible && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                  <Gift className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950">
                    <span className="font-semibold">Special Bundle Offer:</span> Buy 2 or more products from LzgPaw to unlock bundle savings and complimentary companion care perks automatically!
                  </div>
                </div>
              )}

              {/* Key Features */}
              <div className="mt-4 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Key Highlights</p>
                <div className="grid grid-cols-1 gap-1.5 text-xs text-stone-700">
                  {product.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Buy Controls */}
            <div className="pt-4 border-t border-stone-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-stone-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-stone-700 hover:bg-stone-200 transition-colors font-mono"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-semibold font-mono tabular-nums text-stone-900 bg-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-stone-700 hover:bg-stone-200 transition-colors font-mono"
                  >
                    +
                  </button>
                </div>
                <div className="text-xs text-stone-500">
                  Subtotal: <span className="font-bold text-stone-900 font-mono">${(product.price * quantity).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAdd}
                  disabled={!product.inStock}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                    added
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-900 text-white hover:bg-stone-800 active:scale-98'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Bag
                    </>
                  ) : (
                    <>
                      Add {quantity} to Bag · ${(product.price * quantity).toFixed(2)}
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-stone-500 border-t border-stone-100 pt-3">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-stone-700" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-stone-700" />
                  <span>DPO Pay Secure</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RefreshCw className="w-4 h-4 text-stone-700" />
                  <span>30-Day Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
