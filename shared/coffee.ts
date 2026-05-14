import { Roaster } from './roaster';

export type Coffee = {
  id: number;
  name: string;
  origin: string | null;
  process: string | null;
  description: string | null;
  photoUrl: string | null;
  roaster: Roaster;
};
