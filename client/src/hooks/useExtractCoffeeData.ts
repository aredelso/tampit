import { useState, useCallback } from 'react';
import type { ExtractedCoffeeData } from '@shared/coffee';
import { request } from '@/lib/api/request';

interface UseExtractCoffeeDataReturn {
  loading: boolean;
  error: string | null;
  extract: (file: File) => Promise<ExtractedCoffeeData | null>;
}

export function useExtractCoffeeData(): UseExtractCoffeeDataReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extract = useCallback(
    async (file: File): Promise<ExtractedCoffeeData | null> => {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);

      try {
        const extracted = await request<ExtractedCoffeeData>(
          '/api/ai/extract-coffee-data',
          {
            method: 'POST',
            body: formData,
          }
        );
        return extracted;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to extract coffee data';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, extract };
}
