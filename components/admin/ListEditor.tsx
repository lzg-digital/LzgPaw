'use client';

import { Trash2, Plus } from 'lucide-react';

export function ListEditor<T>({
  items,
  onChange,
  renderItem,
  newItem,
  addLabel = 'Add',
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, onChange: (item: T) => void) => React.ReactNode;
  newItem: () => T;
  addLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          {renderItem(item, (updated) => onChange(items.map((it, idx) => (idx === i ? updated : it))))}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="p-2 text-ink/40 hover:text-clay"
            aria-label="Remove"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, newItem()])} className="flex w-fit items-center gap-1.5 text-sm font-medium text-forest">
        <Plus size={16} /> {addLabel}
      </button>
    </div>
  );
}
