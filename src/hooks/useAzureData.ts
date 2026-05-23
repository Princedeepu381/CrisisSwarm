'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  azureApi,
  AzureHealthResponse,
  AzureRootResponse,
  ConnectionState,
  AZURE_BASE_URL,
} from '@/lib/azureApi';

// ─── useAzureHealth ───────────────────────────────────────────────────────────

export interface AzureHealthState {
  status: ConnectionState;
  health: AzureHealthResponse | null;
  root: AzureRootResponse | null;
  latencyMs: number | null;
  lastChecked: Date | null;
  error: string | null;
  isLoading: boolean;
  backendUrl: string;
}

/**
 * Polls the Azure backend's /health and / endpoints.
 * Falls back to 'offline' state gracefully if unreachable.
 */
export function useAzureHealth(pollIntervalMs = 30000): AzureHealthState & { refresh: () => void } {
  const [state, setState] = useState<AzureHealthState>({
    status: 'connecting',
    health: null,
    root: null,
    latencyMs: null,
    lastChecked: null,
    error: null,
    isLoading: true,
    backendUrl: AZURE_BASE_URL,
  });

  const isMounted = useRef(true);

  const check = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, status: prev.status === 'offline' ? 'connecting' : prev.status }));

    const [healthResult, rootResult] = await Promise.all([
      azureApi.getHealth(),
      azureApi.getRoot(),
    ]);

    if (!isMounted.current) return;

    const isHealthy = !healthResult.error && healthResult.data !== null;
    const statusStr = healthResult.data?.status?.toLowerCase() ?? '';

    let connectionState: ConnectionState;
    if (!isHealthy) {
      connectionState = 'offline';
    } else if (statusStr === 'degraded' || (healthResult.latencyMs ?? 0) > 3000) {
      connectionState = 'degraded';
    } else {
      connectionState = 'live';
    }

    setState({
      status: connectionState,
      health: healthResult.data,
      root: rootResult.data,
      latencyMs: healthResult.latencyMs,
      lastChecked: new Date(),
      error: healthResult.error,
      isLoading: false,
      backendUrl: AZURE_BASE_URL,
    });
  }, []);

  useEffect(() => {
    isMounted.current = true;
    check();

    const interval = setInterval(check, pollIntervalMs);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [check, pollIntervalMs]);

  return { ...state, refresh: check };
}

// ─── useAzureLatencyHistory ───────────────────────────────────────────────────

export interface LatencyPoint {
  time: string;
  latencyMs: number;
  status: ConnectionState;
}

/**
 * Maintains a rolling 20-point history of backend latency measurements.
 * Useful for sparkline charts.
 */
export function useAzureLatencyHistory(pollIntervalMs = 15000) {
  const [history, setHistory] = useState<LatencyPoint[]>([]);

  useEffect(() => {
    async function measure() {
      const result = await azureApi.getHealth();
      const point: LatencyPoint = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        latencyMs: result.latencyMs,
        status: result.error ? 'offline' : result.latencyMs > 3000 ? 'degraded' : 'live',
      };
      setHistory((prev) => [...prev.slice(-19), point]);
    }

    measure();
    const interval = setInterval(measure, pollIntervalMs);
    return () => clearInterval(interval);
  }, [pollIntervalMs]);

  return history;
}

// ─── useAzureErrorTrigger ─────────────────────────────────────────────────────

/**
 * Exposes a function to trigger the /error endpoint (for alert testing).
 */
export function useAzureErrorTrigger() {
  const [triggered, setTriggered] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function trigger() {
    setTriggered(true);
    const res = await azureApi.triggerError();
    setResult(res.error ?? 'Error triggered — Azure Monitor alert pipeline active');
    setTimeout(() => { setTriggered(false); setResult(null); }, 4000);
  }

  return { trigger, triggered, result };
}
