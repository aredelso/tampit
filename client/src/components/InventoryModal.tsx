'use client';

import { useState } from 'react';
import { Button } from './Button';

export function InventoryModal({
  mode = 'add',
  onSubmit,
  onCancel,
}: {
  mode?: 'add' | 'edit' | 'duplicate';
  onSubmit: (roastDate?: Date) => Promise<void>;
  onCancel: () => void;
}) {
  const [roastDate, setRoastDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const date = roastDate ? new Date(roastDate) : undefined;
      await onSubmit(date);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-h)' }}>
        {mode === 'add'
          ? 'Add to '
          : `${mode[0].toUpperCase()}${mode.slice(1)}`}{' '}
        Inventory
      </h2>

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text-h)' }}
        >
          Roast Date (optional)
        </label>
        <input
          type="date"
          value={roastDate}
          onChange={(e) => setRoastDate(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-h)',
          }}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          When this coffee was roasted
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" loading={loading}>
          Add to Inventory
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}
