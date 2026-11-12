import type { Coffee } from './coffee';

export type CoffeeInventory = {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  coffeeId: number;
  roastDate: string | null;
  quantity: number;
  notes: string | null;
  coffee: Coffee;
};

export type CoffeeInventoryPayload = {
  coffeeId: number;
  roastDate?: string | Date;
  quantity?: number;
  notes?: string;
};
