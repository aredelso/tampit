export type Recipe = {
  id: number;
  userId: string;
  title: string;
  description?: string;
  instructions?: string;
  brewMethod: string;
  grindSize?: string;
  dose: number;
  waterMl?: number;
  notes?: string;
  phases?: RecipePhase[];
  brewTime?: number;
  userName?: string;
  userPhoto?: string;
  likes: number;
  likedBy?: Array<{ userId: string; userName: string }>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type RecipePhase = {
  name: string;
  waterAmount?: number;
  waterTemp?: number;
  startTime?: number;
  notes?: string;
};
