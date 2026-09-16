import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { AdminSignOutButton } from '@/components/admin/AdminSignOutButton';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/bundles', label: 'Bundles' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/discounts', label: 'Discount Codes' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/settings', label: 'Settings' },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // Second, authoritative layer of the admin gate — see middleware.ts for
  // the first ("is anyone logged in at all") layer.
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-forest-100 bg-white/60 p-6 sm:flex">
        <span className="font-serif text-xl text-forest">LzgPaw Admin</span>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink transition hover:bg-sage"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8 text-xs text-ink/50">
          <p className="font-medium text-ink/70">{admin.name}</p>
          <p>{admin.email}</p>
          <AdminSignOutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-10">
        <div className="mb-5 overflow-x-auto sm:hidden" aria-label="Admin navigation">
          <nav className="flex min-w-max gap-2 rounded-2xl border border-forest/10 bg-white/70 p-2 shadow-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold text-ink transition hover:bg-sage hover:text-forest"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {children}
      </main>
    </div>
  );
}
