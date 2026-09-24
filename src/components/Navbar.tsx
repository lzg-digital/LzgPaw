import React, { useState, useEffect } from 'react';
import { ShoppingBag, Bell, Shield, Menu, X, Gift, Truck } from 'lucide-react';
import { NotificationService } from '../services/notifications';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  isAdmin: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenNotifications,
  isAdmin,
}) => {
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    const updateCount = () => {
      const notifs = NotificationService.getNotifications();
      setUnreadNotifsCount(notifs.filter((n) => !n.read).length);
    };
    updateCount();
    return NotificationService.subscribe(updateCount);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop Catalog' },
    { id: 'bundles', label: 'Bundle Offers' },
    { id: 'tracking', label: 'Track Order' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200">
      {/* Announcement Bar: Free Delivery on Every Order */}
      {bannerVisible && (
        <div className="bg-[#1E293B] text-stone-100 text-xs py-2 px-4 flex items-center justify-between transition-all">
          <div className="w-full flex items-center justify-center gap-4 text-center">
            <span className="flex items-center gap-1.5 font-medium tracking-wide">
              <Truck className="w-3.5 h-3.5 text-amber-300" />
              <span>Free Delivery on Every Order Worldwide</span>
            </span>
            <span className="hidden sm:inline text-stone-400">·</span>
            <span className="hidden sm:flex items-center gap-1.5 text-amber-200">
              <Gift className="w-3.5 h-3.5" />
              <span>Bundle Deal: Buy 2 or More Products to Unlock Extra Perks & Savings!</span>
            </span>
          </div>
          <button
            onClick={() => setBannerVisible(false)}
            className="text-stone-400 hover:text-white p-0.5 ml-2 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Bar 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          onClick={() => {
            onNavigate('home');
            setMobileMenuOpen(false);
          }}
          className="font-display text-2xl font-bold tracking-tight text-stone-900 hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
        >
          <span>LzgPaw</span>
          <span className="text-xs font-sans uppercase tracking-widest text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded font-semibold">
            Pet Goods
          </span>
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-600">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`hover:text-stone-900 transition-colors pb-0.5 whitespace-nowrap cursor-pointer ${
                currentView === link.id
                  ? 'text-stone-900 font-semibold border-b-2 border-stone-900'
                  : ''
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg relative transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="bg-stone-900 text-white px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Bag</span>
            <span className="tabular-nums bg-stone-700 px-1.5 py-0.5 rounded text-[11px] font-bold">
              {cartCount}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF9F6] border-b border-stone-200 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                currentView === link.id
                  ? 'bg-stone-200 text-stone-900 font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
