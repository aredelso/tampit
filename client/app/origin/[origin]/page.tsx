'use client';

import { use } from 'react';
import { useCoffeesByOrigin } from '@/hooks/useCoffees';
import { PageHeader } from '@/components/PageHeader';
import { CoffeeCard } from '@/components/CoffeeCard';

export default function OriginPage({
  params,
}: {
  params: Promise<{ origin: string }>;
}) {
  const { origin } = use(params);
  const decoded = decodeURIComponent(origin);

  const { coffees, loading: isLoading } = useCoffeesByOrigin(decoded);

  return (
    <div className="space-y-6">
      <PageHeader
        title={decoded}
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
          No coffees found for this origin.
        </p>
      ) : (
        <ul
          className="space-y-2"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {coffees.map((coffee) => (
            <li key={coffee.id}>
              <CoffeeCard coffee={coffee} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
