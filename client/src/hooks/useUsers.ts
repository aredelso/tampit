import useSWR from 'swr';
import type { UserCoffee } from '@/lib/api/users';
import type { Recipe } from '@shared/recipe';
import { api } from '@/lib/api';

export function useUsers(userId: string) {
  const { data: user } = useSWR(`/users/${userId}`, () =>
    api.users.get(userId)
  );

  const { data: userCoffees = [] } = useSWR<UserCoffee[]>(
    `/users/${userId}/coffees`,
    () => api.users.coffees(userId)
  );

  const { data: userEntries = [], isLoading: isUserEntriesLoading } = useSWR(
    `/users/${userId}/entries`,
    () => api.users.entries(userId)
  );

  const { data: userRecipes = [], isLoading: isUserRecipesLoading } = useSWR<
    Recipe[]
  >(`/users/${userId}/recipes`, () => api.recipes.byUser(userId));

  return {
    user,
    userEntries,
    isUserEntriesLoading,
    userCoffees,
    userRecipes,
    isUserRecipesLoading,
  };
}
