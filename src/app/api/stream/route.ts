// ─── SSE Stream Endpoint ─────────────────────────────────────────────────────
// Streams real-time agent terminal logs, incident updates, and telemetry events
// to the frontend via Server-Sent Events.

import { db, seedDatabase } from '@/lib/db';
import {
  type StreamEvent,
  getSseClients,
  getEventQueue,
} from '@/lib/stream';

export const dynamic = 'force-dynamic';

// ─── GET /api/stream ─────────────────────────────────────────────────────────

export async function GET(): Promise<Response> {
  // Ensure DB is seeded
  await seedDatabase();

  const encoder = new TextEncoder();

  let currentController: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(controller) {
      currentController = controller;
      getSseClients().add(controller);

      // Send initial connection event
      const connectEvent: StreamEvent = {
        type: 'heartbeat',
        data: {
          message: 'Connected to CrisisSwarm SSE stream',
          activeIncidents: db.incidents.filter(i => i.status !== 'resolved').length,
          agentCount: db.agents.length,
        },
        timestamp: new Date().toISOString(),
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(connectEvent)}\n\n`));

      // Send recent event history (last 10 events)
      const recentEvents = getEventQueue().slice(-10);
      for (const event of recentEvents) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          break;
        }
      }

      // Heartbeat every 15 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          const hb: StreamEvent = {
            type: 'heartbeat',
            data: {
              activeIncidents: db.incidents.filter(i => i.status !== 'resolved').length,
              systemHealth: db.metrics.system_health,
            },
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(hb)}\n\n`));
        } catch {
          clearInterval(heartbeat);
          if (currentController) {
            getSseClients().delete(currentController);
          }
        }
      }, 15000);

      // Flush to confirm open
      controller.enqueue(encoder.encode(`:ok\n\n`));
    },
    cancel() {
      if (currentController) {
        getSseClients().delete(currentController);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
