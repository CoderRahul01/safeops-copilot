import { useState, useEffect, useCallback } from 'react';

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
  const [context, setContext] = useState<CloudContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContext = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("http://127.0.0.1:8080/api/context");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      console.log("🔄 SafeOps: Real-time context updated", data);
      setContext(data);
    } catch (err) {
      console.error("❌ SafeOps: Failed to fetch context", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

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