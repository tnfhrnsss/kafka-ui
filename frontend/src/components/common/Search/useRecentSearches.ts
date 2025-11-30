import { useState, useCallback } from 'react';

interface UseRecentSearchesOptions {
  storageKey?: string;
  maxRecent?: number;
}

const useRecentSearches = ({
  storageKey,
  maxRecent = 5,
}: UseRecentSearchesOptions) => {
  const [recent, setRecent] = useState<string[]>([]);

  const loadRecent = useCallback(() => {
    if (!storageKey) return [] as string[];
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter((s) => typeof s === 'string') : [];
    } catch {
      return [];
    }
  }, [storageKey]);

  const saveRecent = useCallback(
    (q: string) => {
      if (!storageKey) return;
      const trimmed = q.trim();
      if (!trimmed) return;
      const next = [
        trimmed,
        ...loadRecent().filter((s) => s !== trimmed),
      ].slice(0, maxRecent);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
        setRecent(next);
      } catch {
        // Ignore storage errors
      }
    },
    [storageKey, maxRecent, loadRecent]
  );

  const removeRecent = useCallback(
    (item: string) => {
      if (!storageKey) return;
      try {
        const next = loadRecent().filter((s) => s !== item);
        localStorage.setItem(storageKey, JSON.stringify(next));
        setRecent(next);
      } catch {
        // Ignore storage errors
      }
    },
    [storageKey, loadRecent]
  );

  const clearAllRecent = useCallback(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify([]));
      setRecent([]);
    } catch {
      // Ignore storage errors
    }
  }, [storageKey]);

  const refreshRecent = useCallback(() => {
    setRecent(loadRecent());
  }, [loadRecent]);

  return {
    recent,
    saveRecent,
    removeRecent,
    clearAllRecent,
    refreshRecent,
  };
};

export default useRecentSearches;
