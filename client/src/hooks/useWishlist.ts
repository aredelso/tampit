import { useTransition } from 'react';
import useSWR from 'swr';
import type { Coffee } from '@shared/coffee';
import { api } from '@/lib/api';

export type WishlistItem = {
  id: number;
  coffeeId: number;
  coffee: Coffee;
};

export function useWishlist() {
  const [isPending, startTransition] = useTransition();
  const { data: wishlist = [], mutate } = useSWR<WishlistItem[]>(
    '/wishlist',
    () => api.wishlist.list(),
    { revalidateOnFocus: false }
  );

  const add = async (coffeeId: number) => {
    startTransition(async () => {
      const optimisticWishlist = [
        ...wishlist,
        {
          id: Math.random(),
          coffeeId,
          coffee: {
            id: 0,
            name: '',
            roaster: { id: 0, name: '', logoUrl: null },
          },
        } as WishlistItem,
      ];

      await mutate(optimisticWishlist, false);

      try {
        await api.wishlist.add(coffeeId);
        await mutate();
      } catch (error) {
        console.error('Failed to add to wishlist:', error);
        await mutate();
      }
    });
  };

  const remove = async (coffeeId: number) => {
    startTransition(async () => {
      const optimisticWishlist = wishlist.filter(
        (item) => item.coffeeId !== coffeeId
      );

      await mutate(optimisticWishlist, false);

      try {
        await api.wishlist.remove(coffeeId);
        await mutate();
      } catch (error) {
        console.error('Failed to remove from wishlist:', error);
        await mutate();
      }
    });
  };

  const isInWishlist = (coffeeId: number) => {
    return (wishlist as WishlistItem[]).some(
      (item) => item.coffeeId === coffeeId
    );
  };

  return {
    wishlist,
    add,
    remove,
    isInWishlist,
    isPending,
  };
}
