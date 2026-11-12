import useSWR from 'swr';
import type { Coffee } from '@shared/coffee';
import type { CoffeeWithStats } from '@/lib/api/coffees';
import { api } from '@/lib/api/uploads';

export function useCoffees(roasterId?: number) {
  const { data: coffees = [], isLoading: loading } = useSWR<Coffee[]>(
    roasterId ? `/coffees?roasterId=${roasterId}` : null,
    () => api.coffees.list(roasterId)
  );

  const findCoffeeById = (id: number) => api.coffees.findOne(id);

  return { coffees, findCoffeeById, loading };
}

export function useCoffeesByOrigin(origin?: string) {
  const { data: coffees = [], isLoading: loading } = useSWR<CoffeeWithStats[]>(
    origin ? `/coffees/by-origin/${origin}` : null,
    origin ? () => api.coffees.byOrigin(origin) : null
  );

  return { coffees, loading };
}
