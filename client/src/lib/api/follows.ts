import { request } from './request';

export type UserFollowStatus = { following: boolean };
export type UserFollowCounts = { followers: number; following: number };
export type RoasterFollowCounts = { followers: number };
export type UserSummary = {
  id: string;
  name: string | null;
  photo: string | null;
};
export type RoasterSummary = {
  id: number;
  name: string;
  logoUrl: string | null;
};

export const follows = {
  followUser: (id: string) =>
    request<void>(`/follows/users/${id}`, { method: 'POST' }),
  unfollowUser: (id: string) =>
    request<void>(`/follows/users/${id}`, { method: 'DELETE' }),
  userStatus: (id: string) =>
    request<UserFollowStatus>(`/follows/users/${id}/status`),
  userCounts: (id: string) =>
    request<UserFollowCounts>(`/follows/users/${id}/counts`),
  userFollowers: (id: string) =>
    request<UserSummary[]>(`/follows/users/${id}/followers`),
  userFollowingUsers: (id: string) =>
    request<UserSummary[]>(`/follows/users/${id}/following/users`),
  userFollowingRoasters: (id: string) =>
    request<RoasterSummary[]>(`/follows/users/${id}/following/roasters`),

  followRoaster: (id: number) =>
    request<void>(`/follows/roasters/${id}`, { method: 'POST' }),
  unfollowRoaster: (id: number) =>
    request<void>(`/follows/roasters/${id}`, { method: 'DELETE' }),
  roasterStatus: (id: number) =>
    request<{ following: boolean }>(`/follows/roasters/${id}/status`),
  roasterCounts: (id: number) =>
    request<RoasterFollowCounts>(`/follows/roasters/${id}/counts`),
  roasterFollowers: (id: number) =>
    request<UserSummary[]>(`/follows/roasters/${id}/followers`),
};
