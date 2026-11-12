import type { Entry } from '@shared/entry';
import type { AuthUser } from './auth';
import { request, json } from './request';

export type UserCoffee = {
  id: number;
  name: string;
  origin: string | null;
  roasterId: number;
  roasterName: string;
  roasterLogoUrl: string | null;
  entryCount: number;
  avgRating: number | null;
};

export const users = {
  get: (id: string) =>
    request<{
      id: string;
      name: string | null;
      email: string | null;
      photo: string | null;
    }>(`/users/${id}`),
  update: (id: string, data: { photo?: string }) =>
    request<AuthUser>(`/users/${id}`, { method: 'PATCH', ...json(data) }),
  coffees: (id: string) => request<UserCoffee[]>(`/users/${id}/coffees`),
  entries: (id: string) => request<Entry[]>(`/users/${id}/entries`),
};
