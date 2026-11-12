import type { CoffeeInventory, CoffeeInventoryPayload } from '@shared/coffee-inventory';
import { request, json } from './request';

export const inventory = {
  list: () => request<CoffeeInventory[]>('/inventory'),
  get: (coffeeId: number) => request<CoffeeInventory>(`/inventory/${coffeeId}`),
  add: (payload: CoffeeInventoryPayload) =>
    request<CoffeeInventory>('/inventory', { method: 'POST', ...json(payload) }),
  update: (coffeeId: number, payload: Partial<CoffeeInventoryPayload>) =>
    request<CoffeeInventory>(`/inventory/${coffeeId}`, {
      method: 'PUT',
      ...json(payload),
    }),
  remove: (coffeeId: number) =>
    request<void>(`/inventory/${coffeeId}`, { method: 'DELETE' }),
};
