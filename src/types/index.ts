// Navigation and UI types
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: number;
  description?: string;
}

export interface MenuItem {
  label: string;
  items: NavItem[];
}

// Incident types
export interface Incident {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  status: 'active' | 'investigating' | 'resolved';
  created_at: string;
  updated_at?: string;
  affected_service?: string;
}

// Telemetry types
export interface TelemetryData {
  id: string;
  cpu_usage: number;
  memory_usage: number;
  request_count: number;
  response_time: number;
  created_at: string;
}

// Alert types
export interface Alert {
  id: string;
  type: 'cpu' | 'memory' | 'response_time' | 'error_rate' | 'custom';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  message: string;
  created_at: string;
  dismissed?: boolean;
}

// Swarm agent types
export interface SwarmAgent {
  id: string;
  agent_name: string;
  status: 'active' | 'idle' | 'investigating' | 'resolving';
  current_task: string;
  created_at: string;
  response_time?: number;
  success_rate?: number;
}

// Dashboard metrics
export interface DashboardMetrics {
  total_incidents: number;
  active_alerts: number;
  system_health: number;
  response_time_avg: number;
  cpu_avg: number;
  memory_avg: number;
  request_rate: number;
}
