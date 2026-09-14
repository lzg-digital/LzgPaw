'use client';

import { useEffect, useState } from 'react';
import { ListEditor } from '@/components/admin/ListEditor';
import type { SiteSettings } from '@/types';

const ICON_OPTIONS = ['shield', 'truck', 'returns', 'support', 'leaf', 'package'];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save settings');
      setMessage('Settings saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save settings');
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <p className="text-ink/60">Loading…</p>;

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-ink">Settings</h1>
      <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-8">
        <fieldset className="rounded-2xl bg-white/60 p-5">
          <legend className="px-1 font-serif text-lg text-ink">Announcement bar</legend>
          <input
            value={settings.announcement_bar_text}
            onChange={(e) => update('announcement_bar_text', e.target.value)}
            placeholder="e.g. FREE TRACKED SHIPPING ON SELECTED ORDERS"
            maxLength={200}
            className="mt-3 w-full rounded-lg border border-forest/20 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-ink/50">Leave blank to hide the announcement bar entirely.</p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white/60 p-5">
          <legend className="px-1 font-serif text-lg text-ink">Trust strip</legend>
          <p className="mt-1 text-xs text-ink/50">Only add claims that are actually true for this business — this section is hidden entirely when empty.</p>
          <div className="mt-3">
            <ListEditor
              items={settings.trust_items}
              onChange={(items) => update('trust_items', items)}
              newItem={() => ({ icon: 'shield', label: '' })}
              addLabel="Add trust item"
              renderItem={(item, onChange) => (
                <div className="flex flex-1 gap-2">
                  <select value={item.icon} onChange={(e) => onChange({ ...item, icon: e.target.value })} className="rounded-lg border border-forest/20 px-2 py-2 text-sm">
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  <input
                    value={item.label}
                    onChange={(e) => onChange({ ...item, label: e.target.value })}
                    placeholder="e.g. Secure Checkout"
                    className="flex-1 rounded-lg border border-forest/20 px-3 py-2 text-sm"
                  />
                </div>
              )}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white/60 p-5">
          <legend className="px-1 font-serif text-lg text-ink">Shipping</legend>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm text-ink">
              Flat shipping rate
              <input
                type="number"
                step="0.01"
                value={settings.shipping_flat_rate}
                onChange={(e) => update('shipping_flat_rate', Number(e.target.value))}
                className="rounded-lg border border-forest/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Free shipping threshold (optional)
              <input
                type="number"
                step="0.01"
                value={settings.free_shipping_threshold ?? ''}
                onChange={(e) => update('free_shipping_threshold', e.target.value ? Number(e.target.value) : null)}
                className="rounded-lg border border-forest/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Return window (days, optional)
              <input
                type="number"
                value={settings.return_window_days ?? ''}
                onChange={(e) => update('return_window_days', e.target.value ? Number(e.target.value) : null)}
                className="rounded-lg border border-forest/20 px-3 py-2"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white/60 p-5">
          <legend className="px-1 font-serif text-lg text-ink">Contact & social</legend>
          <label className="mt-3 flex flex-col gap-1 text-sm text-ink">
            Support email
            <input
              type="email"
              value={settings.support_email}
              onChange={(e) => update('support_email', e.target.value)}
              className="rounded-lg border border-forest/20 px-3 py-2"
            />
          </label>
          <div className="mt-4">
            <ListEditor
              items={settings.social_links}
              onChange={(items) => update('social_links', items)}
              newItem={() => ({ platform: '', url: '' })}
              addLabel="Add social link"
              renderItem={(item, onChange) => (
                <div className="flex flex-1 gap-2">
                  <input
                    value={item.platform}
                    onChange={(e) => onChange({ ...item, platform: e.target.value })}
                    placeholder="Instagram"
                    className="w-32 rounded-lg border border-forest/20 px-3 py-2 text-sm"
                  />
                  <input
                    value={item.url}
                    onChange={(e) => onChange({ ...item, url: e.target.value })}
                    placeholder="https://instagram.com/lzgpaw"
                    className="flex-1 rounded-lg border border-forest/20 px-3 py-2 text-sm"
                  />
                </div>
              )}
            />
          </div>
        </fieldset>

        {message && <p className="text-sm text-ink/70">{message}</p>}

        <button type="submit" disabled={saving} className="w-fit rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
