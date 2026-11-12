'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import type { Entry } from '@shared/entry';
import { api, type EntryPayload, type FeedResponse } from '@/lib/api';
import type { SeedResponse } from '@/lib/api/dev';
import { useUser } from '../context/UserContext';
import { apolloClient } from '@/lib/graphql/apollo-client';
import {
  LIKE_ENTRY,
  UNLIKE_ENTRY,
  COMMENT_ENTRY,
  LIKE_COMMENT,
  UNLIKE_COMMENT,
} from '@/lib/graphql/entry.mutations';

export type { EntryPayload };

const ENTRIES_KEY = '/entries';
const fetcher = () => api.entries.list();

export function useEntries({
  limit = 10,
  feedType,
}: { limit?: number; feedType?: string } = {}) {
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const mutatingRef = useRef(new Set<number>());

  const {
    data: entries = [],
    isLoading: loading,
    mutate,
  } = useSWR<Entry[]>(ENTRIES_KEY, fetcher);

  const feedKey = feedType
    ? `/entries/feed?page=${currentPage}&feed=${feedType}`
    : `/entries/feed?page=${currentPage}`;

  const {
    data: feedResponse,
    isLoading: loadingFeed,
    mutate: mutateFeed,
  } = useSWR<FeedResponse>(feedKey, () =>
    api.entries.feed(currentPage, limit, feedType)
  );

  async function mutateWith(fn: () => Promise<unknown>): Promise<boolean> {
    try {
      await fn();
      await mutate();
      await mutateFeed();
      await globalMutate(
        (key: unknown) => typeof key === 'string' && key.startsWith('/users/'),
        undefined,
        { revalidate: true }
      );
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  // Initialize or update allEntries with first page
  useEffect(() => {
    if (feedResponse && currentPage === 1 && allEntries.length === 0) {
      setAllEntries(feedResponse.data);
    }
  }, [feedResponse, currentPage, allEntries.length]);

  const entryFeed = currentPage === 1 ? (feedResponse?.data ?? []) : allEntries;
  const hasMore = currentPage < (feedResponse?.pagination.totalPages ?? 1);

  async function loadMore() {
    if (hasMore) {
      const nextPage = currentPage + 1;
      const response = await api.entries.feed(nextPage, limit);
      setAllEntries((prev) => [...prev, ...response.data]);
      setCurrentPage(nextPage);
    }
  }

  function updateEntryInFeed(
    entryId: number,
    updateFn: (entry: Entry) => Entry
  ) {
    if (currentPage === 1 && feedResponse) {
      const updated = feedResponse.data.map((e) =>
        e.id === entryId ? updateFn(e) : e
      );
      mutateFeed({ ...feedResponse, data: updated }, false);
    } else if (allEntries.length > 0) {
      const updated = allEntries.map((e) =>
        e.id === entryId ? updateFn(e) : e
      );
      setAllEntries(updated);
    }
  }

  const addEntry = useCallback(
    (payload: EntryPayload) => mutateWith(() => api.entries.create(payload)),
    []
  );
  const updateEntry = useCallback(
    (id: number, payload: EntryPayload) =>
      mutateWith(() => api.entries.update(id, payload)),
    []
  );
  const deleteEntry = useCallback(
    (id: number) => mutateWith(() => api.entries.remove(id)),
    []
  );

  const likeEntry = useCallback(
    async (id: number) => {
      if (mutatingRef.current.has(id)) return;

      mutatingRef.current.add(id);

      const userIdentifier = user?.id;
      updateEntryInFeed(id, (e) => ({
        ...e,
        likes: e.likes + 1,
        likedBy: userIdentifier
          ? [
              ...(e.likedBy ?? []),
              { id: -1, userId: userIdentifier, userName: user?.name ?? null },
            ]
          : e.likedBy,
      }));
      try {
        await apolloClient.mutate({
          mutation: LIKE_ENTRY,
          variables: { entryId: id },
        });
      } catch (err) {
        console.error(err);
        updateEntryInFeed(id, (e) => ({
          ...e,
          likes: Math.max(0, e.likes - 1),
          likedBy: (e.likedBy ?? []).filter(
            (likeInfo) => likeInfo.userId !== userIdentifier
          ),
        }));
      } finally {
        mutatingRef.current.delete(id);
      }
    },
    [user?.name, user?.id]
  );

  const unlikeEntry = useCallback(
    async (id: number) => {
      if (mutatingRef.current.has(id)) return;

      mutatingRef.current.add(id);

      const userIdentifier = user?.id;
      updateEntryInFeed(id, (e) => ({
        ...e,
        likes: Math.max(0, e.likes - 1),
        likedBy: (e.likedBy ?? []).filter(
          (likeInfo) => likeInfo.userId !== userIdentifier
        ),
      }));
      try {
        await apolloClient.mutate({
          mutation: UNLIKE_ENTRY,
          variables: { entryId: id },
        });
      } catch (err) {
        console.error(err);
        updateEntryInFeed(id, (e) => ({
          ...e,
          likes: e.likes + 1,
          likedBy: userIdentifier
            ? [
                ...(e.likedBy ?? []),
                {
                  id: -1,
                  userId: userIdentifier,
                  userName: user?.name ?? null,
                },
              ]
            : e.likedBy,
        }));
      } finally {
        mutatingRef.current.delete(id);
      }
    },
    [user?.name, user?.id]
  );

  const commentEntry = useCallback(
    async (id: number, content: string) => {
      const comment = {
        id: Math.random(),
        content,
        userId: user?.id ?? '',
        userName: user?.name ?? null,
        userPhoto: user?.photo ?? null,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
      };
      updateEntryInFeed(id, (e) => ({
        ...e,
        comments: [...(e.comments ?? []), comment],
      }));
      try {
        await apolloClient.mutate({
          mutation: COMMENT_ENTRY,
          variables: { entryId: id, content },
        });
      } catch (err) {
        console.error(err);
        updateEntryInFeed(id, (e) => ({
          ...e,
          comments: (e.comments ?? []).filter((c) => c.id !== comment.id),
        }));
      }
    },
    [user?.id, user?.name, user?.photo]
  );
  const likeComment = useCallback(
    async (entryId: number, commentId: number) => {
      if (mutatingRef.current.has(commentId)) return;

      mutatingRef.current.add(commentId);

      const userIdentifier = user?.id;
      updateEntryInFeed(entryId, (e) => ({
        ...e,
        comments: (e.comments ?? []).map((c) =>
          c.id === commentId
            ? {
                ...c,
                likes: c.likes + 1,
                likedBy: userIdentifier
                  ? [
                      ...(c.likedBy ?? []),
                      {
                        id: -1,
                        userId: userIdentifier,
                        userName: user?.name ?? null,
                      },
                    ]
                  : c.likedBy,
              }
            : c
        ),
      }));
      try {
        await apolloClient.mutate({
          mutation: LIKE_COMMENT,
          variables: { entryId, commentId },
        });
      } catch (err) {
        console.error(err);
        updateEntryInFeed(entryId, (e) => ({
          ...e,
          comments: (e.comments ?? []).map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  likes: Math.max(0, c.likes - 1),
                  likedBy: (c.likedBy ?? []).filter(
                    (likeInfo) => likeInfo.userId !== userIdentifier
                  ),
                }
              : c
          ),
        }));
      } finally {
        mutatingRef.current.delete(commentId);
      }
    },
    [user?.name, user?.id]
  );

  const unlikeComment = useCallback(
    async (entryId: number, commentId: number) => {
      if (mutatingRef.current.has(commentId)) return;

      mutatingRef.current.add(commentId);

      const userIdentifier = user?.id;
      updateEntryInFeed(entryId, (e) => ({
        ...e,
        comments: (e.comments ?? []).map((c) =>
          c.id === commentId
            ? {
                ...c,
                likes: Math.max(0, c.likes - 1),
                likedBy: (c.likedBy ?? []).filter(
                  (likeInfo) => likeInfo.userId !== userIdentifier
                ),
              }
            : c
        ),
      }));
      try {
        await apolloClient.mutate({
          mutation: UNLIKE_COMMENT,
          variables: { entryId, commentId },
        });
      } catch (err) {
        console.error(err);
        updateEntryInFeed(entryId, (e) => ({
          ...e,
          comments: (e.comments ?? []).map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  likes: c.likes + 1,
                  likedBy: userIdentifier
                    ? [
                        ...(c.likedBy ?? []),
                        {
                          userId: userIdentifier,
                          userName: user?.name ?? null,
                        },
                      ]
                    : c.likedBy,
                }
              : c
          ),
        }));
      } finally {
        mutatingRef.current.delete(commentId);
      }
    },
    [user?.name, user?.id]
  );
  return useMemo(
    () => ({
      entries,
      loading,
      entryFeed,
      mutateFeed,
      loadingFeed,
      loadMore,
      hasMore,
      addEntry,
      updateEntry,
      deleteEntry,
      likeEntry,
      unlikeEntry,
      commentEntry,
      likeComment,
      unlikeComment,
      seed: async (): Promise<SeedResponse | undefined> => {
        let result: SeedResponse | undefined;
        await mutateWith(async () => {
          result = await api.dev.seed();
        });
        return result;
      },
    }),
    [entries, loading, entryFeed, loadingFeed, hasMore]
  );
}

export function useCoffeeEntries(coffeeId: number | null) {
  const { data: entries = [], isLoading } = useSWR<Entry[]>(
    coffeeId ? `/entries/by-coffee/${coffeeId}` : null,
    () => api.entries.byCoffee(coffeeId!)
  );
  return { entries, isLoading };
}

export function useTagEntries(tag: string) {
  const key = `/entries/by-tag/${encodeURIComponent(tag)}`;
  const { data: entries = [], isLoading } = useSWR<Entry[]>(
    tag ? key : null,
    () => api.entries.byTag(tag)
  );
  return { entries, isLoading };
}

export function useUserEntries(userId: string | null) {
  const { data: entries = [], isLoading: loading } = useSWR<Entry[]>(
    userId ? `/users/${userId}/entries` : null,
    () => api.users.entries(userId!)
  );
  return { entries, loading };
}

export function useRoasterEntries(roasterId: number | null) {
  const {
    data: entries = [],
    isLoading: loading,
    mutate,
  } = useSWR<Entry[]>(roasterId ? `/roasters/${roasterId}/entries` : null, () =>
    api.roasters.entries(roasterId!)
  );
  return { entries, loading, mutate };
}
