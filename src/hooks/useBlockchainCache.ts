import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  persistToStorage?: boolean; // Persist cache to localStorage
}

class BlockchainCache {
  private cache = new Map<string, CacheEntry<any>>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100, // 100 entries max
      persistToStorage: true,
      ...options
    };

    // Load from localStorage on init
    if (this.options.persistToStorage && typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  set<T>(key: string, data: T, customTtl?: number): void {
    const now = Date.now();
    const ttl = customTtl || this.options.ttl;
    
    // Clear expired entries and enforce max size
    this.cleanup();
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };

    this.cache.set(key, entry);
    
    if (this.options.persistToStorage) {
      this.saveToStorage();
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      if (this.options.persistToStorage) {
        this.saveToStorage();
      }
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
    if (this.options.persistToStorage) {
      this.saveToStorage();
    }
  }

  clear(): void {
    this.cache.clear();
    if (this.options.persistToStorage) {
      this.saveToStorage();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }

    // Enforce max size by removing oldest entries
    if (this.cache.size >= this.options.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = entries.slice(0, entries.length - this.options.maxSize + 1);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  private saveToStorage(): void {
    try {
      const cacheData = Array.from(this.cache.entries());
      localStorage.setItem('k3hoot-blockchain-cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const cached = localStorage.getItem('k3hoot-blockchain-cache');
      if (cached) {
        const cacheData = JSON.parse(cached);
        this.cache = new Map(cacheData);
        this.cleanup(); // Remove any expired entries
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  // Get cache stats for debugging
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    const expired = entries.filter(entry => now > entry.expiresAt).length;
    
    return {
      totalEntries: this.cache.size,
      expiredEntries: expired,
      validEntries: this.cache.size - expired,
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }
}

// Global cache instance
const globalCache = new BlockchainCache({
  ttl: 3 * 60 * 1000, // 3 minutes for blockchain data
  maxSize: 50,
  persistToStorage: true
});

export function useBlockchainCache<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  options: {
    enabled?: boolean;
    ttl?: number;
    refetchOnMount?: boolean;
  } = {}
) {
  const {
    enabled = true,
    ttl,
    refetchOnMount = false
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    try {
      setError(null);
      
      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cached = globalCache.get<T>(key);
        if (cached) {
          setData(cached);
          setFromCache(true);
          return cached;
        }
      }

      setLoading(true);
      setFromCache(false);
      
      const result = await fetchFunction();
      
      // Cache the result
      globalCache.set(key, result, ttl);
      setData(result);
      
      return result;

    } catch (err: any) {
      console.error(`Cache fetch error for ${key}:`, err);
      setError(err.message || 'Failed to fetch data');
      
      // Try to return stale cache data on error
      const staleData = globalCache.get<T>(key);
      if (staleData) {
        setData(staleData);
        setFromCache(true);
        return staleData;
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, fetchFunction, enabled, ttl]);

  const invalidate = useCallback(() => {
    globalCache.delete(key);
    setData(null);
    setFromCache(false);
  }, [key]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    if (enabled && (!data || refetchOnMount)) {
      fetchData();
    }
  }, [fetchData, enabled, data, refetchOnMount]);

  return {
    data,
    loading,
    error,
    fromCache,
    fetchData,
    invalidate,
    refresh,
    // Cache utilities
    clearCache: () => globalCache.clear(),
    getCacheStats: () => globalCache.getStats()
  };
}

// Hook for multiple cached queries
export function useMultipleBlockchainCache<T>(
  queries: Array<{
    key: string;
    fetchFunction: () => Promise<T>;
    ttl?: number;
  }>,
  options: {
    enabled?: boolean;
    parallel?: boolean;
  } = {}
) {
  const { enabled = true, parallel = true } = options;
  
  const [results, setResults] = useState<Map<string, T>>(new Map());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const fetchAll = useCallback(async () => {
    if (!enabled || queries.length === 0) return;

    try {
      setLoading(true);
      
      if (parallel) {
        const promises = queries.map(async ({ key, fetchFunction, ttl }) => {
          try {
            // Check cache
            const cached = globalCache.get<T>(key);
            if (cached) {
              return { key, data: cached, error: null };
            }

            // Fetch fresh data
            const data = await fetchFunction();
            globalCache.set(key, data, ttl);
            return { key, data, error: null };
          } catch (err: any) {
            return { key, data: null, error: err.message };
          }
        });

        const results = await Promise.all(promises);
        
        const newResults = new Map<string, T>();
        const newErrors = new Map<string, string>();
        
        results.forEach(({ key, data, error }) => {
          if (data) {
            newResults.set(key, data);
          }
          if (error) {
            newErrors.set(key, error);
          }
        });
        
        setResults(newResults);
        setErrors(newErrors);

      } else {
        // Sequential execution
        const newResults = new Map<string, T>();
        const newErrors = new Map<string, string>();
        
        for (const { key, fetchFunction, ttl } of queries) {
          try {
            const cached = globalCache.get<T>(key);
            if (cached) {
              newResults.set(key, cached);
              continue;
            }

            const data = await fetchFunction();
            globalCache.set(key, data, ttl);
            newResults.set(key, data);
          } catch (err: any) {
            newErrors.set(key, err.message);
          }
        }
        
        setResults(newResults);
        setErrors(newErrors);
      }

    } catch (err) {
      console.error('Multi-cache fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [queries, enabled, parallel]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    results,
    loading,
    errors,
    refetch: fetchAll,
    hasErrors: errors.size > 0,
    allLoaded: results.size === queries.length
  };
}
