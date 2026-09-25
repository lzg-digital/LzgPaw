import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BundleOfferBanner } from './components/BundleOfferBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { DPOPaymentModal } from './components/DPOPaymentModal';
import { TrackingPage } from './components/TrackingPage';
import { FAQSPage } from './components/FAQSPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { TermsPrivacyPage } from './components/TermsPrivacyPage';
import { AdminPortal } from './components/AdminPortal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { Footer } from './components/Footer';

import { Product, CartItem, BundleOffer, Order, ProductCategory } from './types/store';
import { StoreStorage } from './services/storeStorage';
import { NotificationService } from './services/notifications';
import { ArrowRight, Search, SlidersHorizontal, Gift, ShieldCheck, Heart, Sparkles, Check } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [bundleOffer, setBundleOffer] = useState<BundleOffer>(StoreStorage.getBundleOffer());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');

  // Catalog Filtering & Sorting
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'discount'>('featured');

  // URL-based stealth routing for Admin
  const checkIsAdminUrl = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path.endsWith('/admin') ||
      path.endsWith('/lzg-admin') ||
      hash === '#admin' ||
      hash === '#/admin' ||
      hash === '#/lzg-admin' ||
      search.includes('admin=true') ||
      search.includes('admin=portal') ||
      search.includes('admin')
    );
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.location.hash = '#admin';
    } else if (window.location.hash.includes('admin')) {
      history.replaceState(null, '', window.location.pathname);
    }
  };

  useEffect(() => {
    const handleUrlRoute = () => {
      if (checkIsAdminUrl()) {
        setCurrentView('admin');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);

    // Stealth keyboard shortcut for store owner: Alt+A or Ctrl+Shift+A
    const handleKeyNav = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        handleNavigate('admin');
      }
    };
    window.addEventListener('keydown', handleKeyNav);

    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('keydown', handleKeyNav);
    };
  }, []);

  // Load initial store state
  useEffect(() => {
    setProducts(StoreStorage.getProducts());
    setCart(StoreStorage.getCart());
    setBundleOffer(StoreStorage.getBundleOffer());

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Handle Cart Operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let updatedCart: CartItem[];

    if (existingIndex > -1) {
      updatedCart = [...cart];
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart = [...cart, { product, quantity }];
    }

    setCart(updatedCart);
    StoreStorage.saveCart(updatedCart);
    setIsCartOpen(true);

    // Check if multi-item bundle was activated!
    const totalItems = updatedCart.reduce((sum, i) => sum + i.quantity, 0);
    if (bundleOffer.active && totalItems === bundleOffer.requiredQuantity) {
      NotificationService.sendPushNotification(
        '✨ Multi-Item Savings Activated in Your Bag!',
        `You added ${totalItems} items! Your multi-item bundle savings and bonus companion pack are now included.`
      );
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const updatedCart = cart
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    setCart(updatedCart);
    StoreStorage.saveCart(updatedCart);
  };

  const handleRemoveItem = (productId: string) => {
    const updatedCart = cart.filter((item) => item.product.id !== productId);
    setCart(updatedCart);
    StoreStorage.saveCart(updatedCart);
  };

  const handleOrderSuccess = (order: Order) => {
    setCart([]);
    StoreStorage.saveCart([]);
    setTrackingOrderId(order.id);
  };

  const handleTrackSpecificOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
    setCurrentView('tracking');
    setIsNotificationsOpen(false);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Filter and sort products
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'discount') {
      const discA = a.compareAtPrice > a.price ? a.compareAtPrice - a.price : 0;
      const discB = b.compareAtPrice > b.price ? b.compareAtPrice - b.price : 0;
      return discB - discA;
    }
    return 0; // featured default
  });

  const categories: ProductCategory[] = ['All', 'Dogs', 'Cats', 'Care & Grooming', 'Toys & Accessories'];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1E293B]">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        isAdmin={StoreStorage.isAdminAuthenticated()}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <div className="space-y-12 sm:space-y-16 pb-12">
            <HeroSection
              onShopClick={() => setCurrentView('shop')}
              onBundleClick={() => setCurrentView('bundles')}
            />

            {/* Bundle Promo Highlight Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <BundleOfferBanner
                bundleOffer={bundleOffer}
                cart={cart}
                onShopQualifying={() => setCurrentView('shop')}
              />
            </div>

            {/* Featured Pet Essentials Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                    Handpicked Favorites
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 mt-1">
                    Featured Pet Essentials
                  </h2>
                </div>
                <button
                  onClick={() => setCurrentView('shop')}
                  className="text-xs sm:text-sm font-semibold text-stone-900 hover:text-amber-800 flex items-center gap-1.5 transition-colors cursor-pointer group"
                >
                  <span>View All {products.length} Products</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onSelectProduct={setSelectedProduct}
                  />
                ))}
              </div>
            </section>

            {/* Craftsmanship & Veterinary Philosophy Section */}
            <section className="bg-white border-y border-stone-200 py-12 sm:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 space-y-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                      The LzgPaw Difference
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 leading-snug">
                      Engineered for Animal Wellness, Built to Last Years
                    </h2>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                      Every pet deserves human-grade comfort. Our memory foam beds relieve pressure points for aging joints, our ultra-quiet filtration systems encourage continuous feline hydration, and our organic balms protect delicate paws in harsh weather.
                    </p>
                    <div className="pt-2 space-y-2 text-xs text-stone-800 font-medium">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Zero Toxic Glues, Phthalates, or Artificial Scent Fillers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Free Global Delivery On Every Order · No Minimum Basket</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Seamless Checkout Powered by DPO Pay Encrypted Gateway</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900 font-bold">
                        1
                      </div>
                      <h3 className="font-bold text-stone-900 text-sm">Dual-Layer Orthopedic Foam</h3>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Medical grade core foam prevents joint stiffness and hip dysplasia progression in growing and senior pets.
                      </p>
                    </div>

                    <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900 font-bold">
                        2
                      </div>
                      <h3 className="font-bold text-stone-900 text-sm">Hygienic 304 Stainless</h3>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Eliminates feline chin acne caused by porous plastic bowls with hospital-grade stainless steel surfaces.
                      </p>
                    </div>

                    <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900 font-bold">
                        3
                      </div>
                      <h3 className="font-bold text-stone-900 text-sm">Automated Free Gift Perks</h3>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Order 2 or more products and receive our Organic Shea Butter Paw Rescue Balm ($22 Value) automatically at $0.00.
                      </p>
                    </div>

                    <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900 font-bold">
                        4
                      </div>
                      <h3 className="font-bold text-stone-900 text-sm">Live Courier GPS Status</h3>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Stay notified via browser push alerts as our carrier routes your parcel directly to your front porch.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: SHOP CATALOG */}
        {currentView === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-stone-900">
                  Shop Pet Essentials
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Enjoy Free Worldwide Delivery on every item · Buy 2 to unlock a Free Organic Paw Balm
                </p>
              </div>
              <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium self-start sm:self-auto">
                Free Delivery Applied at Checkout
              </div>
            </div>

            {/* Filter and Search Controls */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search beds, fountains, leashes, balms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <SlidersHorizontal className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-500 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-900 font-medium cursor-pointer"
                  >
                    <option value="featured">Featured Essentials</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="discount">Highest Savings %</option>
                  </select>
                </div>
              </div>

              {/* Segmented Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            {sortedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400">
                <Search className="w-12 h-12 mx-auto stroke-[1.2] mb-2" />
                <p className="text-base font-semibold text-stone-800">No matching pet products</p>
                <p className="text-xs text-stone-500 mt-1">Try resetting search keywords or category filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onSelectProduct={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: BUNDLES (BUY 2 FREE GIFT) */}
        {currentView === 'bundles' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
            <BundleOfferBanner
              bundleOffer={bundleOffer}
              cart={cart}
              onShopQualifying={() => setCurrentView('shop')}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-stone-900">
                    Bundle Eligible Products
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    Select any 2 or more eligible items below to automatically activate multi-item bundle savings.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Check Bag ({totalCartCount}/2)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products
                  .filter((p) => p.isBundleEligible)
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onSelectProduct={setSelectedProduct}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: TRACKING */}
        {currentView === 'tracking' && (
          <TrackingPage
            initialOrderId={trackingOrderId}
            onNavigateToContact={() => setCurrentView('contact')}
          />
        )}

        {/* VIEW: FAQS */}
        {currentView === 'faqs' && (
          <FAQSPage onNavigateToContact={() => setCurrentView('contact')} />
        )}

        {/* VIEW: ABOUT */}
        {currentView === 'about' && (
          <AboutPage
            onNavigateToShop={() => setCurrentView('shop')}
            onNavigateToContact={() => setCurrentView('contact')}
          />
        )}

        {/* VIEW: CONTACT */}
        {currentView === 'contact' && (
          <ContactPage
            onNavigateToFaqs={() => setCurrentView('faqs')}
            onNavigateToTracking={() => setCurrentView('tracking')}
          />
        )}

        {/* VIEW: TERMS & PRIVACY */}
        {currentView === 'terms-privacy' && (
          <TermsPrivacyPage onNavigateToContact={() => setCurrentView('contact')} />
        )}

        {/* VIEW: ADMIN */}
        {currentView === 'admin' && (
          <AdminPortal
            onOrderUpdated={(orderId) => {
              setTrackingOrderId(orderId);
            }}
            onNavigateToStore={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        bundleOffer={bundleOffer}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* DPO Pay Payment Gateway Modal */}
      <DPOPaymentModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        bundleOffer={bundleOffer}
        onOrderSuccess={handleOrderSuccess}
        onNavigateToTracking={handleTrackSpecificOrder}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectOrder={handleTrackSpecificOrder}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
