export type { AuthUser, AuthResponse } from './auth';
export type { EntryPayload, FeedResponse } from './entries';
export type { RecipePayload } from './recipes';
export type { Recipe } from '@shared/recipe';
export type {
  CoffeeInventory,
  CoffeeInventoryPayload,
} from '@shared/coffee-inventory';

import { auth } from './auth';
import { entries } from './entries';
import { users } from './users';
import { dev } from './dev';
import { roasters } from './roasters';
import { coffees } from './coffees';
import { tags } from './tags';
import { wishlist } from './wishlist';
import { recipes } from './recipes';
import { follows } from './follows';
import { inventory } from './inventory';

export const api = {
  auth,
  entries,
  users,
  dev,
  roasters,
  coffees,
  tags,
  wishlist,
  recipes,
  follows,
  inventory,
};
