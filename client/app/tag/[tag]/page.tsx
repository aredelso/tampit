'use client';

import { use } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { CoffeeCard } from '@/components/CoffeeCard';
import { PageHeader } from '@/components/PageHeader';

export default function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = use(params);
  const decodedTag = decodeURIComponent(tag);
  const { data: coffees = [], isLoading } = useSWR(
    `/entries/coffees-by-tag/${decodedTag}`,
    () => api.entries.coffeesByTag(decodedTag)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={'Viewing similar coffees with tag ' + decodedTag}
        meta={
          <p className="text-sm">
            {coffees.length} {coffees.length === 1 ? 'coffee' : 'coffees'}
          </p>
        }
      />

      {isLoading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading…
        </p>
      ) : coffees.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No entries for this tag.
        </p>
      ) : (
        <ul
          className="space-y-2"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {coffees.map((c) => (
            <li key={c.id}>
              <CoffeeCard coffee={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
