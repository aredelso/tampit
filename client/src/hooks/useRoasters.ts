import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Roaster } from '@shared/roaster';
import { RoasterPayload } from '@/lib/api/roasters';
import { CoffeePayload } from '@/lib/api/coffees';

export function useRoasters(query?: string) {
  const q = query?.trim() ?? '';
  const key = q ? `/roasters?search=${encodeURIComponent(q)}` : '/roasters';

  const { data: roasters = [], isLoading: loading } = useSWR<Roaster[]>(
    key,
    () => (q ? api.roasters.search(q) : api.roasters.list())
  );

  const findRoasterById = (id: number) => api.roasters.findOne(id);

  const addRoaster = (payload: RoasterPayload) => api.roasters.create(payload);

  const addRoasterCoffee = (coffeePayload: CoffeePayload) =>
    api.coffees.create(coffeePayload);

  return { roasters, loading, findRoasterById, addRoaster, addRoasterCoffee };
}

export function useRoaster(roasterId: number | null) {
  const {
    data: roaster,
    isLoading: loading,
    mutate,
  } = useSWR<Roaster>(roasterId ? `/roasters/${roasterId}` : null, () =>
    api.roasters.findOne(roasterId!)
  );

  return { roaster, loading, mutate };
}
