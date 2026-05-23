// ─── Azure Backend API Client ─────────────────────────────────────────────────
// Live backend: https://crisisswarmapp-bhfvchcd6fhgtdd.southeastasia-01.azurewebsites.net

export const AZURE_BASE_URL = '';

// ─── Response Types ───────────────────────────────────────────────────────────

export interface AzureRootResponse {
  message: string;
  status?: string;
  timestamp?: string;
  version?: string;
  environment?: string;
}

export interface AzureHealthResponse {
  status: string;              // "healthy" | "degraded" | "unhealthy"
  uptime?: number;             // seconds
  timestamp?: string;
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu?: number;
  version?: string;
  environment?: string;
  services?: {
    database?: string;
    cache?: string;
    insights?: string;
  };
  // Flexible — backend may return extra fields
  [key: string]: unknown;
}

export interface AzureApiMetrics {
  requests_per_minute?: number;
  avg_response_time_ms?: number;
  error_rate_percent?: number;
  uptime_percent?: number;
  [key: string]: unknown;
}

// ─── Connection State ─────────────────────────────────────────────────────────

export type ConnectionState = 'connecting' | 'live' | 'degraded' | 'offline';

// ─── API Fetch Helper ─────────────────────────────────────────────────────────

interface FetchOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

async function azureFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<{ data: T | null; latencyMs: number; error: string | null }> {
  const { timeoutMs = 8000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const start = Date.now();
  try {
    const res = await fetch(`${AZURE_BASE_URL}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      // No-store so we always get fresh data
      cache: 'no-store',
    });
    const latencyMs = Date.now() - start;

    if (!res.ok) {
      return { data: null, latencyMs, error: `HTTP ${res.status}: ${res.statusText}` };
    }

    // Try to parse JSON; some endpoints may return plain text
    const contentType = res.headers.get('content-type') ?? '';
    let data: T;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      // Wrap plain-text responses in an object
      data = { message: text } as T;
    }

    return { data, latencyMs, error: null };
  } catch (err) {
    const latencyMs = Date.now() - start;
    if (err instanceof Error && err.name === 'AbortError') {
      return { data: null, latencyMs, error: 'Request timed out' };
    }
    return { data: null, latencyMs, error: String(err) };
  } finally {
    clearTimeout(timer);
  }
}

// ─── Public API Methods ───────────────────────────────────────────────────────

export const azureApi = {
  /** GET /api — root status */
  getRoot: () => azureFetch<AzureRootResponse>('/api'),

  /** GET /api/health — health check */
  getHealth: () => azureFetch<AzureHealthResponse>('/api/health'),

  /** GET /api/error — simulate failure (for alert testing) */
  triggerError: () => azureFetch<{ error: string }>('/api/error'),

  /** GET /api/incidents — list incidents */
  getIncidents: () => azureFetch<unknown[]>('/api/incidents'),

  /** GET /api/telemetry — telemetry data */
  getTelemetry: () => azureFetch<unknown[]>('/api/telemetry'),

  /** GET /api/agents — swarm agents info */
  getAgents: () => azureFetch<{ agents: unknown[]; terminalLogs: unknown[]; commands: unknown[] }>('/api/agents'),
};
