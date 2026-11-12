import type { Entry, Comment } from '@shared/entry';
import { request, json } from './request';
import { Coffee } from '@shared/coffee';

export type FeedResponse = {
  data: Entry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type EntryPayload = {
  roaster: string;
  roasterId?: number;
  coffee: string;
  coffeeId?: number;
  roasterLocation?: string;
  origin?: string;
  brewMethod: string;
  dose?: number;
  waterMl?: number;
  notes: string;
  rating?: number;
  photoUrl?: string;
  flavorNotes?: string[];
  recipeId?: number;
  userId: string | null;
};

export const entries = {
  list: () => request<Entry[]>('/entries'),
  feed: (page = 1, limit = 10, feedType?: string) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (feedType) params.set('feed', feedType);
    return request<FeedResponse>(`/entries/feed?${params.toString()}`);
  },
  create: (payload: EntryPayload) =>
    request<Entry>('/entries', { method: 'POST', ...json(payload) }),
  update: (id: number, payload: EntryPayload) =>
    request<Entry>(`/entries/${id}`, { method: 'PUT', ...json(payload) }),
  remove: (id: number) => request<void>(`/entries/${id}`, { method: 'DELETE' }),
  byTag: (tag: string) =>
    request<Entry[]>(`/entries/by-tag/${encodeURIComponent(tag)}`),
  coffeesByTag: (tag: string) =>
    request<Coffee[]>(`/entries/coffees-by-tag/${encodeURIComponent(tag)}`),
  byCoffee: (coffeeId: number) =>
    request<Entry[]>(`/entries/by-coffee/${coffeeId}`),
  like: (id: number) =>
    request<void>(`/entries/${id}/likes`, { method: 'POST' }),
  unlike: (id: number) =>
    request<void>(`/entries/${id}/likes`, { method: 'DELETE' }),
  comment: (id: number, content: string) =>
    request<Comment>(`/entries/${id}/comments`, {
      method: 'POST',
      ...json({ content }),
    }),
  likeComment: (entryId: number, commentId: number) =>
    request<void>(`/entries/${entryId}/comments/${commentId}/likes`, {
      method: 'POST',
    }),
  unlikeComment: (entryId: number, commentId: number) =>
    request<void>(`/entries/${entryId}/comments/${commentId}/likes`, {
      method: 'DELETE',
    }),
};
