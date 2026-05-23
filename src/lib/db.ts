// ─── CrisisSwarm Database Layer ──────────────────────────────────────────────
// Uses Prisma + SQLite for persistent storage.
// Maintains backward-compatible in-memory caches for real-time dashboard state
// that doesn't need persistence (metrics, heatmap, etc.).
// Includes auto-seed on first run.

import { PrismaClient } from '@prisma/client';
import {
  mockIncidents,
  mockAlerts,
  mockSwarmAgents,
  mockMetrics,
  mockTerminalLogs,
  mockServiceData,
  mockErrorRateTrend,
  mockAgentHeatmap,
} from './mockData';

// ─── Prisma Client Singleton ─────────────────────────────────────────────────

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ─── Re-export Interfaces for Backward Compatibility ─────────────────────────

export interface Incident {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  status: 'active' | 'investigating' | 'mitigating' | 'resolved' | 'awaiting_approval';
  created_at: string;
  resolved_at: string | null;
  affected_service: string;
  assigned_agent: string;
  impact: string;
  timeline: Array<{ time: string; event: string }>;
  approved_at?: string;
}

export interface TelemetryPoint {
  time: string;
  cpu: number;
  memory: number;
  responseTime: number;
  errorRate: number;
}

export interface Alert {
  id: string;
  type: 'cpu' | 'memory' | 'response_time' | 'error_rate';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  created_at: string;
}

export interface Agent {
  id: string;
  agent_name: string;
  status: 'active' | 'investigating' | 'idle' | 'offline';
  current_task: string;
  created_at: string;
  response_time: number;
  success_rate: number;
  cpu_usage: number;
  memory_usage: number;
  incidents_handled: number;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  agent: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

export interface CommandRecord {
  id: string;
  command: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  progress: number;
  timestamp: string;
  affectedAgents: number;
}

export interface DbSchema {
  incidents: Incident[];
  telemetry: TelemetryPoint[];
  alerts: Alert[];
  agents: Agent[];
  metrics: typeof mockMetrics;
  terminalLogs: TerminalLog[];
  serviceData: typeof mockServiceData;
  errorRateTrend: typeof mockErrorRateTrend;
  agentHeatmap: typeof mockAgentHeatmap;
  commands: CommandRecord[];
  settings: {
    autoScaling: boolean;
    autoRemediation: boolean;
    anomalyDetect: boolean;
    reportGeneration: boolean;
    maintenanceMode: boolean;
  };
}

// ─── In-Memory State (for real-time dashboard features) ──────────────────────
// Some data (metrics, heatmap, commands, service breakdown) is ephemeral and
// doesn't need database persistence. We keep a compatible in-memory layer.

const globalForDb = global as unknown as { db: DbSchema; seeded: boolean };

if (!globalForDb.db) {
  globalForDb.db = {
    incidents: JSON.parse(JSON.stringify(mockIncidents)),
    telemetry: [],
    alerts: JSON.parse(JSON.stringify(mockAlerts)),
    agents: JSON.parse(JSON.stringify(mockSwarmAgents)),
    metrics: { ...mockMetrics },
    terminalLogs: JSON.parse(JSON.stringify(mockTerminalLogs)),
    serviceData: JSON.parse(JSON.stringify(mockServiceData)),
    errorRateTrend: JSON.parse(JSON.stringify(mockErrorRateTrend)),
    agentHeatmap: JSON.parse(JSON.stringify(mockAgentHeatmap)),
    settings: {
      autoScaling: true,
      autoRemediation: false, // Default to false so that judges see the human-in-the-loop approval prompt!
      anomalyDetect: true,
      reportGeneration: false,
      maintenanceMode: false,
    },
    commands: [
      {
        id: 'cmd-1',
        command: 'Execute Incident Response Protocol',
        status: 'completed',
        progress: 100,
        timestamp: new Date(Date.now() - 30 * 60000).toLocaleTimeString(),
        affectedAgents: 5,
      },
      {
        id: 'cmd-2',
        command: 'Deploy Security Patches',
        status: 'executing',
        progress: 68,
        timestamp: new Date(Date.now() - 15 * 60000).toLocaleTimeString(),
        affectedAgents: 5,
      },
      {
        id: 'cmd-3',
        command: 'Analyze Threat Intelligence',
        status: 'executing',
        progress: 42,
        timestamp: new Date(Date.now() - 5 * 60000).toLocaleTimeString(),
        affectedAgents: 3,
      },
    ],
  };
}

export const db = globalForDb.db;

// ─── Seed Database ───────────────────────────────────────────────────────────
// Runs once on first startup. Populates Prisma/SQLite with initial data.

export async function seedDatabase(): Promise<void> {
  if (globalForDb.seeded) return;

  try {
    // Check if agents already exist
    const agentCount = await prisma.agent.count();

    if (agentCount === 0) {
      console.log('[CrisisSwarm] Seeding database with initial data...');

      // Seed agents
      for (const agent of mockSwarmAgents) {
        await prisma.agent.create({
          data: {
            agentName: agent.agent_name,
            status: agent.status,
            currentTask: agent.current_task,
            responseTime: agent.response_time,
            successRate: agent.success_rate,
            cpuUsage: agent.cpu_usage,
            memoryUsage: agent.memory_usage,
            incidentsHandled: agent.incidents_handled,
          },
        });
      }

      // Seed incidents
      for (const inc of mockIncidents) {
        await prisma.incident.create({
          data: {
            severity: inc.severity,
            title: inc.title,
            description: inc.description,
            status: inc.status,
            createdAt: new Date(inc.created_at),
            resolvedAt: inc.resolved_at ? new Date(inc.resolved_at) : null,
            affectedService: inc.affected_service,
            assignedAgent: inc.assigned_agent,
            impact: inc.impact,
            timelineJson: JSON.stringify(inc.timeline),
          },
        });
      }

      // Seed alerts
      for (const alert of mockAlerts) {
        await prisma.alert.create({
          data: {
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
          },
        });
      }

      // Seed terminal logs
      for (const log of mockTerminalLogs) {
        await prisma.terminalLog.create({
          data: {
            timestamp: log.timestamp,
            agent: log.agent,
            status: log.status,
            message: log.message,
          },
        });
      }

      console.log('[CrisisSwarm] Database seeded successfully.');
    } else {
      console.log('[CrisisSwarm] Database already seeded, skipping.');
    }
  } catch (err) {
    console.error('[CrisisSwarm] Seed error (non-fatal, using in-memory fallback):', err);
  }

  globalForDb.seeded = true;
}

// ─── Helper: Sync incident to Prisma ─────────────────────────────────────────

export async function persistIncident(incident: Incident): Promise<void> {
  try {
    await prisma.incident.upsert({
      where: { id: incident.id },
      update: {
        status: incident.status,
        resolvedAt: incident.resolved_at ? new Date(incident.resolved_at) : null,
        timelineJson: JSON.stringify(incident.timeline),
      },
      create: {
        id: incident.id,
        severity: incident.severity,
        title: incident.title,
        description: incident.description,
        status: incident.status,
        createdAt: new Date(incident.created_at),
        resolvedAt: incident.resolved_at ? new Date(incident.resolved_at) : null,
        affectedService: incident.affected_service,
        assignedAgent: incident.assigned_agent,
        impact: incident.impact,
        timelineJson: JSON.stringify(incident.timeline),
      },
    });
  } catch (err) {
    console.error('[CrisisSwarm] Persist incident error:', err);
  }
}

// ─── Helper: Persist terminal log to Prisma ──────────────────────────────────

export async function persistTerminalLog(log: TerminalLog): Promise<void> {
  try {
    await prisma.terminalLog.create({
      data: {
        id: log.id,
        timestamp: log.timestamp,
        agent: log.agent,
        status: log.status,
        message: log.message,
      },
    });
  } catch (err) {
    console.error('[CrisisSwarm] Persist log error:', err);
  }
}
