'use client';

import { useTransition } from 'react';
import { apolloClient } from '@/lib/graphql/apollo-client';
import {
  LIKE_ENTRY,
  UNLIKE_ENTRY,
  COMMENT_ENTRY,
  LIKE_COMMENT,
  UNLIKE_COMMENT,
} from '@/lib/graphql/entry.mutations';

export function useEntryMutations() {
  const [isPending, startTransition] = useTransition();

  const likeEntry = (entryId: number) => {
    startTransition(async () => {
      try {
        await apolloClient.mutate({
          mutation: LIKE_ENTRY,
          variables: { entryId },
        });
      } catch (error) {
        console.error('Failed to like entry:', error);
      }
    });
  };

  const unlikeEntry = (entryId: number) => {
    startTransition(async () => {
      try {
        await apolloClient.mutate({
          mutation: UNLIKE_ENTRY,
          variables: { entryId },
        });
      } catch (error) {
        console.error('Failed to unlike entry:', error);
      }
    });
  };

  const commentEntry = (entryId: number, content: string) => {
    startTransition(async () => {
      try {
        await apolloClient.mutate({
          mutation: COMMENT_ENTRY,
          variables: { entryId, content },
        });
      } catch (error) {
        console.error('Failed to comment on entry:', error);
      }
    });
  };

  const likeComment = (entryId: number, commentId: number) => {
    startTransition(async () => {
      try {
        await apolloClient.mutate({
          mutation: LIKE_COMMENT,
          variables: { entryId, commentId },
        });
      } catch (error) {
        console.error('Failed to like comment:', error);
      }
    });
  };

  const unlikeComment = (entryId: number, commentId: number) => {
    startTransition(async () => {
      try {
        await apolloClient.mutate({
          mutation: UNLIKE_COMMENT,
          variables: { entryId, commentId },
        });
      } catch (error) {
        console.error('Failed to unlike comment:', error);
      }
    });
  };

  return {
    likeEntry,
    unlikeEntry,
    commentEntry,
    likeComment,
    unlikeComment,
    isPending,
  };
}
