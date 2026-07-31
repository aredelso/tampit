import { Roaster } from './roaster';

export type Coffee = {
  id: number;
  name: string;
  origin: string | null;
  variety: string | null;
  farm: string | null;
  process: string | null;
  description: string | null;
  photoUrl: string | null;
  roaster: Roaster;
  avgRating?: number;
  entryCount?: number;
};

export type ExtractedCoffeeData = {
  name?: string;
  origin?: string;
  variety?: string;
  farm?: string;
  process?: string;
  description?: string;
  roasterName?: string;
};
