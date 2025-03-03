"use client";

import { useState, useEffect, useCallback } from "react";

interface FetchOptions extends RequestInit {
  skipLoading?: boolean;
}

interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useDataFetching<T>(
  url: string,
  options?: FetchOptions
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!options?.skipLoading);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!options?.skipLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      setData(data);
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = async () => {
    await fetchData();
  };

  return { data, isLoading, error, refetch };
}

interface MutationOptions<T> extends RequestInit {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseMutationResult<T, P> {
  mutate: (payload: P) => Promise<void>;
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useMutation<T, P = unknown>(
  url: string,
  method: "POST" | "PUT" | "DELETE" | "PATCH" = "POST",
  options?: MutationOptions<T>
): UseMutationResult<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (payload: P) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: JSON.stringify(payload),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      options?.onSuccess?.(result);
    } catch (err) {
      const errorObj =
        err instanceof Error ? err : new Error("An unknown error occurred");
      setError(errorObj);
      options?.onError?.(errorObj);
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, isLoading, error };
}
