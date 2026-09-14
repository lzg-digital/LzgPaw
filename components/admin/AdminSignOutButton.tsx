'use client';

import { useRouter } from 'next/navigation';

export function AdminSignOutButton() {
  const router = useRouter();

  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button type="button" onClick={signOut} className="mt-2 underline hover:text-ink">
      Sign out
    </button>
  );
}
