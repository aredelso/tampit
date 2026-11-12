import type { Coffee } from '@shared/coffee';
import { request, json } from './request';

export type CoffeeWithStats = Coffee & {
  avgRating: number | null;
  entryCount: number;
};

export type CoffeePayload = {
  roasterId: number;
  name: string;
  origin?: string;
  variety?: string;
  farm?: string;
  process?: string;
  description?: string;
  photoUrl?: string;
};

export const coffees = {
  list: (roasterId?: number) =>
    request<CoffeeWithStats[]>(
      roasterId ? `/coffees?roasterId=${roasterId}` : '/coffees'
    ),
  findOne: (id: number) => request<CoffeeWithStats>(`/coffees/${id}`),
  byOrigin: (origin: string) =>
    request<CoffeeWithStats[]>(
      `/coffees/by-origin/${encodeURIComponent(origin)}`
    ),
  create: (payload: CoffeePayload) =>
    request<Coffee>('/coffees', { method: 'POST', ...json(payload) }),
  update: (id: number, payload: Omit<CoffeePayload, 'roasterId'>) =>
    request<Coffee>(`/coffees/${id}`, { method: 'PUT', ...json(payload) }),
};
