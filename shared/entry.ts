export type LikeInfo = {
  userId: string;
  userName: string | null;
};

export type Comment = {
  id: number;
  content: string;
  userId: string;
  userName: string | null;
  userPhoto?: string | null;
  createdAt: string;
  likes: number;
  likedBy: LikeInfo[];
};

export type Entry = {
  id: number;
  createdAt: string;
  roasterId: number;
  roasterName: string;
  roasterLogoUrl: string | null;
  coffeeId: number;
  coffeeName: string;
  coffeePhotoUrl: string | null;
  origin?: string;
  brewMethod: string;
  dose?: number;
  waterMl?: number;
  likes: number;
  likedBy?: LikeInfo[];
  comments?: Comment[];
  userId: string | null;
  userName: string | null;
  userPhoto?: string | null;
  notes?: string | null;
  rating?: number | null;
  photoUrl?: string | null;
  flavorNotes?: string[];
};
