'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Search, User, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?sort=featured', label: 'Best Sellers' },
  { href: '/#bundles', label: 'Bundles' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { itemCount, openCart } = useCart();
  const router = useRouter();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchValue.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(searchValue.trim())}`);
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-forest-100 bg-cream/95 backdrop-blur">
      <div className="container-content flex h-16 items-center justify-between gap-4 sm:h-20">
        <button
          type="button"
          className="-ml-2 p-2 text-forest lg:hidden"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={24} aria-hidden="true" />
        </button>

        <Link href="/" className="shrink-0 font-serif text-2xl font-semibold tracking-tight text-forest sm:text-3xl">
          LzgPaw
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-ink transition hover:text-forest"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center sm:flex">
            {searchOpen ? (
              <form onSubmit={submitSearch} className="flex items-center">
                <input
                  autoFocus
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onBlur={() => !searchValue && setSearchOpen(false)}
                  placeholder="Search products"
                  aria-label="Search products"
                  className="w-40 rounded-full border border-forest/20 bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-forest md:w-56"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2 text-forest transition hover:text-forest-700"
              >
                <Search size={20} aria-hidden="true" />
              </button>
            )}
          </div>

          <Link href="/account" aria-label="Account" className="p-2 text-forest transition hover:text-forest-700">
            <User size={20} aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
            className="relative p-2 text-forest transition hover:text-forest-700"
          >
            <ShoppingBag size={20} aria-hidden="true" />
            {itemCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[10px] font-semibold text-white"
                aria-hidden="true"
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-ink/40 transition-opacity',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-72 max-w-[85vw] transform bg-cream p-6 shadow-xl transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="font-serif text-2xl font-semibold text-forest">LzgPaw</span>
            <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="p-2 text-forest">
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <form onSubmit={submitSearch} className="mb-6">
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="w-full rounded-full border border-forest/20 bg-white px-4 py-2 text-sm outline-none focus:border-forest"
            />
          </form>
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink transition hover:bg-sage"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-ink transition hover:bg-sage"
            >
              Account
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
