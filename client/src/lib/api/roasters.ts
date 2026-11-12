import { Roaster } from '@shared/roaster';
import { request, json } from './request';

export type RoasterPayload = {
  name: string;
  location?: string;
  logoUrl?: string;
};

export const roasters = {
  list: () => request<Roaster[]>('/roasters'),
  search: (query: string) =>
    request<Roaster[]>(`/roasters?search=${encodeURIComponent(query)}`),
  findOne: (id: number) => request<Roaster>(`/roasters/${id}`),
  entries: (id: number) =>
    request<import('@shared/entry').Entry[]>(`/roasters/${id}/entries`),
  create: (payload: RoasterPayload) =>
    request<Roaster>('/roasters', { method: 'POST', ...json(payload) }),
  update: (id: number, payload: RoasterPayload) =>
    request<Roaster>(`/roasters/${id}`, { method: 'PUT', ...json(payload) }),
  remove: (id: number) =>
    request<void>(`/roasters/${id}`, { method: 'DELETE' }),
};
