'use client';

import { useEffect, useState } from 'react';

interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  active: boolean;
  usage_limit: number | null;
  usage_count: number;
  expires_at: string | null;
}

export default function AdminDiscountsPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    fetch('/api/admin/discount-codes')
      .then((res) => res.json())
      .then((data) => setCodes(data.codes ?? []));
  }

  useEffect(load, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, type, value, active: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not create code');
      setCode('');
      setValue(10);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create code');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: DiscountCode) {
    await fetch(`/api/admin/discount-codes/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !c.active }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this discount code?')) return;
    await fetch(`/api/admin/discount-codes/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-ink">Discount Codes</h1>

      <form onSubmit={onCreate} className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl bg-white/60 p-5">
        <label className="flex flex-col gap-1 text-sm text-ink">
          Code
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="WELCOME10"
            className="rounded-lg border border-forest/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Type
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="rounded-lg border border-forest/20 px-3 py-2">
            <option value="percentage">Percentage off</option>
            <option value="fixed">Fixed amount off</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Value
          <input type="number" step="0.01" value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-28 rounded-lg border border-forest/20 px-3 py-2" />
        </label>
        <button type="submit" disabled={saving} className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-60">
          {saving ? 'Adding…' : 'Add Code'}
        </button>
      </form>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {codes.length === 0 ? (
        <p className="text-ink/60">No discount codes yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white/60">
          <table className="w-full text-left text-sm">
            <thead className="text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Used</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-100">
              {codes.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">{c.code}</td>
                  <td className="px-4 py-3">{c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}</td>
                  <td className="px-4 py-3">
                    {c.usage_count}
                    {c.usage_limit ? ` / ${c.usage_limit}` : ''}
                  </td>
                  <td className="px-4 py-3">{c.active ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => toggleActive(c)} className="mr-3 text-forest underline">
                      {c.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button type="button" onClick={() => remove(c.id)} className="text-red-600 underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
