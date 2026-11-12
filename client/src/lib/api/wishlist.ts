import { request } from './request';
import type { WishlistItem } from '@/hooks/useWishlist';

export const wishlist = {
  list: () => request<WishlistItem[]>('/wishlist'),
  add: (coffeeId: number) =>
    request(`/wishlist/coffees/${coffeeId}`, { method: 'POST' }),
  remove: (coffeeId: number) =>
    request(`/wishlist/coffees/${coffeeId}`, { method: 'DELETE' }),
  check: (coffeeId: number) =>
    request<{ inWishlist: boolean }>(
      `/wishlist/coffees/${coffeeId}/check`
    ),
};
