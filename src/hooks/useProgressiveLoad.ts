import { useState, useEffect, useCallback } from 'react';

interface ProgressiveLoadState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  progress: number;
  hasMore: boolean;
  loadMore: () => void;
  retry: () => void;
}

interface ProgressiveLoadOptions<T> {
  batchSize?: number;
  loadDelay?: number; // Delay between batches to avoid overwhelming blockchain
  onProgress?: (progress: number) => void;
}

export function useProgressiveLoad<T>(
  loadFunction: (offset: number, limit: number) => Promise<T[]>,
  totalCount: number,
  options: ProgressiveLoadOptions<T> = {}
): ProgressiveLoadState<T> {
  const {
    batchSize = 6,
    loadDelay = 500,
    onProgress
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const progress = totalCount > 0 ? Math.min((data.length / totalCount) * 100, 100) : 0;

  const loadBatch = useCallback(async (offset: number, isRetry = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);

      const batch = await loadFunction(offset, batchSize);
      
      if (isRetry) {
        setData(batch);
        setCurrentOffset(batch.length);
      } else {
        setData(prev => [...prev, ...batch]);
        setCurrentOffset(prev => prev + batch.length);
      }

      setHasMore(batch.length === batchSize && (offset + batch.length) < totalCount);
      
      if (onProgress) {
        const newProgress = Math.min(((offset + batch.length) / totalCount) * 100, 100);
        onProgress(newProgress);
      }

    } catch (err: any) {
      console.error('Progressive load error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [loadFunction, batchSize, totalCount, loading, onProgress]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    // Add delay to prevent overwhelming the blockchain
    if (currentOffset > 0) {
      await new Promise(resolve => setTimeout(resolve, loadDelay));
    }
    
    await loadBatch(currentOffset);
  }, [hasMore, loading, currentOffset, loadBatch, loadDelay]);

  const retry = useCallback(() => {
    setData([]);
    setCurrentOffset(0);
    setHasMore(true);
    setError(null);
    loadBatch(0, true);
  }, [loadBatch]);

  // Initial load
  useEffect(() => {
    if (totalCount > 0 && data.length === 0 && !loading) {
      loadBatch(0);
    }
  }, [totalCount, data.length, loading, loadBatch]);

  return {
    data,
    loading,
    error,
    progress,
    hasMore,
    loadMore,
    retry
  };
}

// Enhanced version with automatic loading and better UX
export function useAutoProgressiveLoad<T>(
  loadFunction: (offset: number, limit: number) => Promise<T[]>,
  totalCount: number,
  options: ProgressiveLoadOptions<T> & {
    autoLoad?: boolean;
    threshold?: number; // Load more when user scrolls to this percentage
  } = {}
): ProgressiveLoadState<T> & {
  observerRef: (node: HTMLElement | null) => void;
} {
  const {
    autoLoad = true,
    threshold = 0.8,
    ...progressiveOptions
  } = options;

  const progressiveLoad = useProgressiveLoad(loadFunction, totalCount, progressiveOptions);
  const [observerRef, setObserverRef] = useState<HTMLElement | null>(null);

  // Intersection observer for auto-loading
  useEffect(() => {
    if (!autoLoad || !observerRef || !progressiveLoad.hasMore || progressiveLoad.loading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          progressiveLoad.loadMore();
        }
      },
      { threshold }
    );

    observer.observe(observerRef);
    return () => observer.disconnect();
  }, [observerRef, autoLoad, threshold, progressiveLoad.hasMore, progressiveLoad.loading, progressiveLoad.loadMore]);

  const observerRefCallback = useCallback((node: HTMLElement | null) => {
    setObserverRef(node);
  }, []);

  return {
    ...progressiveLoad,
    observerRef: observerRefCallback
  };
}
