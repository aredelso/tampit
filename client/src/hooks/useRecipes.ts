'use client';

import { useMemo, useCallback, useRef } from 'react';
import useSWR from 'swr';
import type { RecipePayload } from '@/lib/api/recipes';
import type { Recipe } from '@shared/recipe';
import { api } from '@/lib/api';
import { apolloClient } from '@/lib/graphql/apollo-client';
import {
  CREATE_RECIPE,
  UPDATE_RECIPE,
  DELETE_RECIPE,
  LIKE_RECIPE,
  UNLIKE_RECIPE,
} from '@/lib/graphql/recipe.mutations';

const RECIPES_KEY = '/recipes';
const fetcher = () => api.recipes.list();

export function useRecipes() {
  const mutatingRef = useRef(new Set<number>());

  const {
    data: recipes = [],
    isLoading: loading,
    mutate,
  } = useSWR<Recipe[]>(RECIPES_KEY, fetcher);

  const createRecipe = useCallback(
    async (payload: RecipePayload) => {
      try {
        const result = await apolloClient.mutate({
          mutation: CREATE_RECIPE,
          variables: { input: payload },
        });
        await mutate();
        return (result.data as any).createRecipe;
      } catch (err) {
        console.error('Failed to create recipe:', err);
        throw err;
      }
    },
    [mutate]
  );

  const updateRecipe = useCallback(
    async (id: number, payload: RecipePayload) => {
      try {
        const result = await apolloClient.mutate({
          mutation: UPDATE_RECIPE,
          variables: { id, input: payload },
        });
        await mutate();
        return (result.data as any).updateRecipe;
      } catch (err) {
        console.error('Failed to update recipe:', err);
        throw err;
      }
    },
    [mutate]
  );

  const deleteRecipe = useCallback(
    async (id: number) => {
      try {
        await apolloClient.mutate({
          mutation: DELETE_RECIPE,
          variables: { id },
        });
        await mutate();
      } catch (err) {
        console.error('Failed to delete recipe:', err);
        throw err;
      }
    },
    [mutate]
  );

  const likeRecipe = useCallback(
    async (id: number) => {
      if (mutatingRef.current.has(id)) return;

      mutatingRef.current.add(id);

      try {
        await apolloClient.mutate({
          mutation: LIKE_RECIPE,
          variables: { recipeId: id },
        });
        await mutate();
      } catch (err) {
        console.error('Failed to like recipe:', err);
      } finally {
        mutatingRef.current.delete(id);
      }
    },
    [mutate]
  );

  const unlikeRecipe = useCallback(
    async (id: number) => {
      if (mutatingRef.current.has(id)) return;

      mutatingRef.current.add(id);

      try {
        await apolloClient.mutate({
          mutation: UNLIKE_RECIPE,
          variables: { recipeId: id },
        });
        await mutate();
      } catch (err) {
        console.error('Failed to unlike recipe:', err);
      } finally {
        mutatingRef.current.delete(id);
      }
    },
    [mutate]
  );

  return useMemo(
    () => ({
      recipes,
      loading,
      createRecipe,
      updateRecipe,
      deleteRecipe,
      likeRecipe,
      unlikeRecipe,
    }),
    [
      recipes,
      loading,
      createRecipe,
      updateRecipe,
      deleteRecipe,
      likeRecipe,
      unlikeRecipe,
    ]
  );
}
