'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';

export function useTags() {
  const { data, isLoading } = useSWR('/tags', () => api.tags.list());
  return { tags: data ?? [], isLoading };
}
