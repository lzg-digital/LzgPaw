'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setMessage(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, customer_name: name, rating, review_text: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      setStatus('done');
      setMessage(data.message);
      setName('');
      setText('');
      setRating(5);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (status === 'done') {
    return <p className="rounded-xl bg-sage/50 p-4 text-sm text-ink/80">{message}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl bg-white/60 p-5">
      <h3 className="font-serif text-lg text-ink">Write a review</h3>

      <fieldset>
        <legend className="text-sm font-medium text-ink">Rating</legend>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n === 1 ? '' : 's'}`}
              aria-pressed={rating === n}
            >
              <Star size={22} className={n <= rating ? 'fill-clay text-clay' : 'text-forest/25'} />
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm text-ink">
        Your name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          className="rounded-lg border border-forest/20 px-3 py-2 outline-none focus:border-forest"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-ink">
        Your review
        <textarea
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          minLength={10}
          maxLength={2000}
          rows={4}
          className="rounded-lg border border-forest/20 px-3 py-2 outline-none focus:border-forest"
        />
      </label>

      {message && status === 'error' && <p className="text-sm text-red-600">{message}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="self-start rounded-full bg-forest px-6 py-2.5 text-sm font-medium text-cream transition hover:bg-forest-700 disabled:opacity-60"
      >
        {status === 'submitting' ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
