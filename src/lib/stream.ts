// ─── CrisisSwarm SSE Event Bus ────────────────────────────────────────────────
// Shared module for Server-Sent Events push utility.
// Extracted from api/stream/route.ts so it can be imported by other API routes
// without violating Next.js 15's route file export constraints.

export interface StreamEvent {
  type: 'terminal_log' | 'incident_update' | 'agent_status' | 'swarm_analysis' | 'heartbeat';
  data: unknown;
  timestamp: string;
}

// ─── Global SSE client registry ──────────────────────────────────────────────

const globalForStream = global as unknown as {
  sseClients: Set<ReadableStreamDefaultController>;
  eventQueue: StreamEvent[];
};

if (!globalForStream.sseClients) {
  globalForStream.sseClients = new Set();
  globalForStream.eventQueue = [];
}

export function getSseClients(): Set<ReadableStreamDefaultController> {
  return globalForStream.sseClients;
}

export function getEventQueue(): StreamEvent[] {
  return globalForStream.eventQueue;
}

/** Push an event to all connected SSE clients and store in the replay queue */
export function pushStreamEvent(event: StreamEvent): void {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(payload);

  // Store in queue for late-joiners (last 50 events)
  globalForStream.eventQueue.push(event);
  if (globalForStream.eventQueue.length > 50) {
    globalForStream.eventQueue = globalForStream.eventQueue.slice(-50);
  }

  for (const controller of globalForStream.sseClients) {
    try {
      controller.enqueue(encoded);
    } catch {
      // Client disconnected — remove from registry
      globalForStream.sseClients.delete(controller);
    }
  }
}
