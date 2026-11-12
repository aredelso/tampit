import type { Recipe } from '@shared/recipe';
import { request, json } from './request';

export type RecipePhase = {
  name: string;
  waterAmount?: number;
  waterTemp?: number;
  startTime?: number;
  notes?: string;
  grindSize?: string;
};

export type RecipePayload = {
  title: string;
  description?: string;
  brewMethod?: string;
  grindSize?: string;
  phases?: RecipePhase[];
  brewTime?: number;
  dose?: number;
  waterMl?: number;
  notes?: string;
};

export const recipes = {
  list: () => request<Recipe[]>('/recipes'),
  get: (id: number) => request<Recipe>(`/recipes/${id}`),
  byUser: (userId: string) => request<Recipe[]>(`/recipes/by-user/${userId}`),
  create: (payload: RecipePayload) =>
    request<Recipe>('/recipes', { method: 'POST', ...json(payload) }),
  update: (id: number, payload: RecipePayload) =>
    request<Recipe>(`/recipes/${id}`, { method: 'PUT', ...json(payload) }),
  delete: (id: number) => request<void>(`/recipes/${id}`, { method: 'DELETE' }),
  like: (id: number) =>
    request<void>(`/recipes/${id}/likes`, { method: 'POST' }),
  unlike: (id: number) =>
    request<void>(`/recipes/${id}/likes`, { method: 'DELETE' }),
};
