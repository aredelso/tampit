'use client';

import { useWishlist, type WishlistItem } from '@/hooks/useWishlist';
import { PageHeader } from '@/components/PageHeader';
import { CoffeeCard } from '@/components/CoffeeCard';

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wishlist"
        meta={
          <p className="text-sm">
            {wishlist.length} {wishlist.length === 1 ? 'coffee' : 'coffees'}
          </p>
        }
      />

      {wishlist.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No coffees in your wishlist yet. Start adding coffees to try!
        </p>
      ) : (
        <ul
          className="space-y-2"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {wishlist.map((item: WishlistItem) => (
            <li key={item.coffee.id}>
              <CoffeeCard coffee={item.coffee} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
