'use client';

import { useTransition } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { UserSummary, RoasterSummary } from '@/lib/api/follows';
import { useUser } from '@/context/UserContext';

export function useUserFollow(targetUserId: string) {
  const { user: currentUser } = useUser();
  const isOwnProfile = currentUser?.id === targetUserId;

  const statusKey =
    currentUser && !isOwnProfile
      ? `/follows/users/${targetUserId}/status`
      : null;
  const countsKey = `/follows/users/${targetUserId}/counts`;
  const followersKey = `/follows/users/${targetUserId}/followers`;
  const followingUsersKey = `/follows/users/${targetUserId}/following/users`;
  const followingRoastersKey = `/follows/users/${targetUserId}/following/roasters`;

  const { data: statusData, mutate: mutateStatus } = useSWR(
    statusKey,
    () => api.follows.userStatus(targetUserId),
    { revalidateOnFocus: false }
  );

  const { data: countsData, mutate: mutateCounts } = useSWR(
    countsKey,
    () => api.follows.userCounts(targetUserId),
    { revalidateOnFocus: false }
  );

  const { data: followersData, mutate: mutateFollowers } = useSWR<
    UserSummary[]
  >(followersKey, () => api.follows.userFollowers(targetUserId), {
    revalidateOnFocus: false,
  });

  const { data: followingUsersData, mutate: mutateFollowingUsers } = useSWR<
    UserSummary[]
  >(followingUsersKey, () => api.follows.userFollowingUsers(targetUserId), {
    revalidateOnFocus: false,
  });

  const { data: followingRoastersData } = useSWR<RoasterSummary[]>(
    followingRoastersKey,
    () => api.follows.userFollowingRoasters(targetUserId),
    { revalidateOnFocus: false }
  );

  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    if (!currentUser || isOwnProfile) return;
    const currently = statusData?.following ?? false;

    startTransition(async () => {
      await mutateStatus({ following: !currently }, false);
      await mutateCounts(
        {
          followers: (countsData?.followers ?? 0) + (currently ? -1 : 1),
          following: countsData?.following ?? 0,
        },
        false
      );

      try {
        if (currently) {
          await api.follows.unfollowUser(targetUserId);
        } else {
          await api.follows.followUser(targetUserId);
        }
      } catch (error) {
        // revert on error
      } finally {
        await mutateStatus();
        await mutateCounts();
        await mutateFollowers();
      }
    });
  };

  return {
    following: statusData?.following ?? false,
    followerCount: countsData?.followers ?? 0,
    followingCount: countsData?.following ?? 0,
    canFollow: !!currentUser && !isOwnProfile,
    isPending,
    toggle,
    followers: followersData ?? [],
    followingUsers: followingUsersData ?? [],
    followingRoasters: followingRoastersData ?? [],
  };
}

export function useRoasterFollow(roasterId: number) {
  const { user: currentUser } = useUser();

  const statusKey = currentUser
    ? `/follows/roasters/${roasterId}/status`
    : null;
  const countsKey = `/follows/roasters/${roasterId}/counts`;
  const followersKey = `/follows/roasters/${roasterId}/followers`;

  const { data: statusData, mutate: mutateStatus } = useSWR(
    statusKey,
    () => api.follows.roasterStatus(roasterId),
    { revalidateOnFocus: false }
  );

  const { data: countsData, mutate: mutateCounts } = useSWR(
    countsKey,
    () => api.follows.roasterCounts(roasterId),
    { revalidateOnFocus: false }
  );

  const { data: followersData, mutate: mutateFollowers } = useSWR<
    UserSummary[]
  >(followersKey, () => api.follows.roasterFollowers(roasterId), {
    revalidateOnFocus: false,
  });

  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    if (!currentUser) return;
    const currently = statusData?.following ?? false;

    startTransition(async () => {
      await mutateStatus({ following: !currently }, false);
      await mutateCounts(
        { followers: (countsData?.followers ?? 0) + (currently ? -1 : 1) },
        false
      );

      try {
        if (currently) {
          await api.follows.unfollowRoaster(roasterId);
        } else {
          await api.follows.followRoaster(roasterId);
        }
      } catch (error) {
        // revert on error
      } finally {
        await mutateStatus();
        await mutateCounts();
        await mutateFollowers();
      }
    });
  };

  return {
    following: statusData?.following ?? false,
    followerCount: countsData?.followers ?? 0,
    canFollow: !!currentUser,
    isPending,
    toggle,
    followers: followersData ?? [],
  };
}
