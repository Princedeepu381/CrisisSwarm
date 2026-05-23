import {
  mockTelemetryData,
  mockIncidents,
  mockAlerts,
  mockSwarmAgents,
  mockMetrics,
  mockTerminalLogs,
  mockServiceData,
  mockErrorRateTrend,
  mockAgentHeatmap,
} from './mockData';

export interface Incident {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  status: 'active' | 'investigating' | 'resolved';
  created_at: string;
  resolved_at: string | null;
  affected_service: string;
  assigned_agent: string;
  impact: string;
  timeline: Array<{ time: string; event: string }>;
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
}

// Global binding for hot-reload persistence in Next.js development
const globalForDb = global as unknown as { db: DbSchema };

if (!globalForDb.db) {
  globalForDb.db = {
    incidents: JSON.parse(JSON.stringify(mockIncidents)),
    telemetry: JSON.parse(JSON.stringify(mockTelemetryData)),
    alerts: JSON.parse(JSON.stringify(mockAlerts)),
    agents: JSON.parse(JSON.stringify(mockSwarmAgents)),
    metrics: { ...mockMetrics },
    terminalLogs: JSON.parse(JSON.stringify(mockTerminalLogs)),
    serviceData: JSON.parse(JSON.stringify(mockServiceData)),
    errorRateTrend: JSON.parse(JSON.stringify(mockErrorRateTrend)),
    agentHeatmap: JSON.parse(JSON.stringify(mockAgentHeatmap)),
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
