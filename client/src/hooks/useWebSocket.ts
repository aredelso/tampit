'use client';

import { useEffect } from 'react';
import { mutate } from 'swr';
import type { Entry, Comment } from '@shared/entry';

// WebSockets run in the browser, so use the public API URL.
const WS_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
).replace(
  /^http/,
  'ws'
);

type WsMsg =
  | {
      type: 'likes_updated';
      entryId: number;
      likes: number;
      likedBy: import('@shared/entry').LikeInfo[];
    }
  | { type: 'comment_added'; entryId: number; comment: Comment };

export function useWebSocket() {
  useEffect(() => {
    let ws: WebSocket | null = null;
    let retryDelay = 1000;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    function connect() {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        retryDelay = 1000;
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data as string) as WsMsg;
        mutate(
          '/entries',
          (entries: Entry[] | undefined) => {
            if (!entries) return entries;
            return entries.map((e) => {
              if (e.id !== msg.entryId) return e;
              if (msg.type === 'likes_updated') {
                return { ...e, likes: msg.likes, likedBy: msg.likedBy };
              }
              if (msg.type === 'comment_added') {
                return { ...e, comments: [...(e.comments ?? []), msg.comment] };
              }
              return e;
            });
          },
          { revalidate: false }
        );
      };

      ws.onclose = () => {
        if (stopped) return;
        retryTimer = setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, 30_000);
          connect();
        }, retryDelay);
      };
    }

    connect();
    return () => {
      stopped = true;
      if (retryTimer) clearTimeout(retryTimer);
      ws?.close();
    };
  }, []);
}
