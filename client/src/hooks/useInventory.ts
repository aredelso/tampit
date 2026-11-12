'use client';

import { useMemo, useCallback } from 'react';
import useSWR from 'swr';
import type {
  CoffeeInventory,
  CoffeeInventoryPayload,
} from '@shared/coffee-inventory';
import { api } from '@/lib/api';

export function useInventory() {
  const {
    data: inventory = [],
    isLoading: loading,
    mutate,
  } = useSWR<CoffeeInventory[]>('/inventory', () => api.inventory.list());

  const add = useCallback(
    async (payload: CoffeeInventoryPayload) => {
      try {
        const result = await api.inventory.add(payload);
        await mutate();
        return result;
      } catch (err) {
        console.error('Failed to add to inventory:', err);
        throw err;
      }
    },
    [mutate]
  );

  const update = useCallback(
    async (coffeeId: number, payload: Partial<CoffeeInventoryPayload>) => {
      try {
        const result = await api.inventory.update(coffeeId, payload);
        await mutate();
        return result;
      } catch (err) {
        console.error('Failed to update inventory:', err);
        throw err;
      }
    },
    [mutate]
  );

  const remove = useCallback(
    async (inventoryId: number) => {
      try {
        await api.inventory.remove(inventoryId);
        await mutate();
      } catch (err) {
        console.error('Failed to remove from inventory:', err);
        throw err;
      }
    },
    [mutate]
  );

  const getItem = useCallback(
    (coffeeId: number) => {
      return inventory.find((item) => item.coffeeId === coffeeId);
    },
    [inventory]
  );

  const hasItem = useCallback(
    (coffeeId: number) => {
      return inventory.some((item) => item.coffeeId === coffeeId);
    },
    [inventory]
  );

  return useMemo(
    () => ({
      inventory,
      loading,
      add,
      update,
      remove,
      getItem,
      hasItem,
    }),
    [inventory, loading, add, update, remove, getItem, hasItem]
  );
}
