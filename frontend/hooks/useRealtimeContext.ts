import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthProvider';

interface CloudContext {
  billingStatus: {
    freeTierSafe: boolean;
    totalSpend: number;
    limit: number;
    percentageUsed: number;
  };
  recommendation: string;
  metrics: {
    active_resources: number;
    risk_count: number;
    saving_potential: string;
  };
}

export function useRealtimeContext() {
  const { user } = useAuth();
  const [context, setContext] = useState<CloudContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContext = useCallback(async () => {
    if (!user) return;
    try {
      const { fetchWithAuth } = await import('../utils/api');
      setError(null);
      const res = await fetchWithAuth('/api/context');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setContext(data);
    } catch (err) {
      console.error("❌ SafeOps: Failed to fetch context", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  // Set up real-time polling (since we don't have WebSocket setup yet)
  useEffect(() => {
    const interval = setInterval(fetchContext, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchContext]);

  return {
    context,
    isLoading,
    error,
    refetch: fetchContext
  };
}