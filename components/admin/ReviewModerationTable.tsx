'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StarRating } from '@/components/ui/StarRating';
import { formatDate } from '@/lib/utils';

interface ReviewRow {
  id: string;
  product_name: string;
  customer_name: string;
  rating: number;
  review_text: string;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  verified_purchase: boolean;
  created_at: string;
}

export function ReviewModerationTable({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(id: string, status: ReviewRow['status']) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this review permanently?')) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (reviews.length === 0) {
    return <p className="text-ink/60">No reviews yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-2xl bg-white/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-ink/50">{review.product_name}</p>
              <StarRating average={review.rating} count={1} />
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                review.status === 'approved'
                  ? 'bg-forest/10 text-forest'
                  : review.status === 'pending'
                    ? 'bg-clay/10 text-clay-700'
                    : 'bg-ink/10 text-ink/60'
              }`}
            >
              {review.status}
            </span>
          </div>
          <p className="mt-3 text-sm text-ink/80">{review.review_text}</p>
          <div className="mt-2 text-xs text-ink/50">
            {review.customer_name}
            {review.verified_purchase && <span className="ml-1.5 text-forest">· Verified Purchase</span>}
            {' · '}
            {formatDate(review.created_at)}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton disabled={busyId === review.id} onClick={() => setStatus(review.id, 'approved')}>
              Approve
            </ActionButton>
            <ActionButton disabled={busyId === review.id} onClick={() => setStatus(review.id, 'rejected')}>
              Reject
            </ActionButton>
            <ActionButton disabled={busyId === review.id} onClick={() => setStatus(review.id, 'hidden')}>
              Hide
            </ActionButton>
            <ActionButton disabled={busyId === review.id} onClick={() => remove(review.id)} destructive>
              Delete
            </ActionButton>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  destructive,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-4 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
        destructive ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'border border-forest/25 text-forest hover:bg-sage'
      }`}
    >
      {children}
    </button>
  );
}
