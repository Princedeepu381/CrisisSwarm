'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import MetricCard from '@/components/common/MetricCard';
import SystemHealth from '@/components/dashboard/SystemHealth';
import IncidentFeed from '@/components/dashboard/IncidentFeed';
import TelemetryChart from '@/components/dashboard/TelemetryChart';
import GlobalCloudRegions from '@/components/dashboard/GlobalCloudRegions';
import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import AzureInsightsSummary from '@/components/azure/AzureInsightsSummary';
import * as LucideIcons from 'lucide-react';
import {
  mockMetrics,
  mockIncidents,
  mockTelemetryData,
  mockAlerts,
  mockSwarmAgents,
} from '@/lib/mockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// ─── Crisis Scenarios ─────────────────────────────────────────────────────────
const CRISIS_SCENARIOS = [
  {
    title: 'API Gateway DDoS Attack Detected',
    description: 'Distributed denial-of-service attack targeting primary API gateway. Traffic anomaly detected across multiple regions. Automated mitigation protocols initiated.',
    severity: 'critical',
    affected_service: 'API Gateway',
    impact: 'Critical',
  },
  {
    title: 'Database Primary Failover Triggered',
    description: 'Primary database cluster experiencing cascading timeout failures. Read replicas promoted. Data integrity verification in progress.',
    severity: 'critical',
    affected_service: 'Database',
    impact: 'Critical',
  },
  {
    title: 'CDN Edge Node Cascade Failure',
    description: 'Multiple CDN edge nodes reporting connectivity loss across Asia-Pacific and European regions. Content delivery severely impacted.',
    severity: 'critical',
    affected_service: 'CDN Edge',
    impact: 'Critical',
  },
  {
    title: 'Auth Service Token Decryption Failure',
    description: 'Authentication microservice unable to decrypt session tokens. All user sessions affected. Emergency key rotation initiated.',
    severity: 'high',
    affected_service: 'Auth Service',
    impact: 'High',
  },
  {
    title: 'Memory Leak in Service Mesh Sidecar',
    description: 'Envoy sidecar proxy containers showing exponential memory growth. Pod evictions increasing. Swarm agents analyzing root cause.',
    severity: 'high',
    affected_service: 'Service Mesh',
    impact: 'High',
  },
];

export default function Dashboard() {
  const [metrics, setMetrics] = useState(mockMetrics);
  const [incidents, setIncidents] = useState<any[]>(mockIncidents);
  const [telemetryData, setTelemetryData] = useState<any[]>(mockTelemetryData);
  const [alerts, setAlerts] = useState<any[]>(mockAlerts);
  const [swarmAgents, setSwarmAgents] = useState<any[]>(mockSwarmAgents);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCrisisTriggering, setIsCrisisTriggering] = useState(false);
  const [crisisFlash, setCrisisFlash] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(
    'Swarm behavior normal. Predictive analysis suggests 99.9% availability for the next 2 hours.'
  );

  const fetchData = useCallback(async (showRefreshingState = false) => {
    if (showRefreshingState) setIsRefreshing(true);
    try {
      const [resHealth, resIncidents, resTelemetry, resAlerts, resAgents] = await Promise.all([
        fetch('/api/health').then((r) => r.json()),
        fetch('/api/incidents').then((r) => r.json()),
        fetch('/api/telemetry').then((r) => r.json()),
        fetch('/api/alerts').then((r) => r.json()),
        fetch('/api/agents').then((r) => r.json()),
      ]);

      if (resHealth) {
        setMetrics({
          total_incidents: resIncidents ? resIncidents.filter((i: any) => i.status !== 'resolved').length : 0,
          active_alerts: resAlerts ? resAlerts.length : 0,
          system_health: resHealth.status === 'healthy' ? 98 : resHealth.status === 'degraded' ? 72 : 45,
          response_time_avg: resHealth.cpu > 70 ? 385 : 195,
          cpu_avg: resHealth.cpu,
          memory_avg: resHealth.memory.percentage,
          request_rate: 2400 + Math.floor(Math.random() * 200),
        });
      }

      if (resIncidents) setIncidents(resIncidents);
      if (resTelemetry) setTelemetryData(resTelemetry);
      if (resAlerts) setAlerts(resAlerts);
      if (resAgents && resAgents.agents) setSwarmAgents(resAgents.agents);
    } catch (e) {
      console.error('Error fetching dashboard API data:', e);
    } finally {
      if (showRefreshingState) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, []);

  // ─── Simulate Crisis Handler ─────────────────────────────────────────────────
  const handleSimulateCrisis = async () => {
    setIsCrisisTriggering(true);
    setCrisisFlash(true);
    setTimeout(() => setCrisisFlash(false), 1500);

    const scenario = CRISIS_SCENARIOS[Math.floor(Math.random() * CRISIS_SCENARIOS.length)];

    try {
      await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario),
      });
      // Immediately refresh to show the impact
      await fetchData();
    } catch (e) {
      console.error('Failed to simulate crisis:', e);
    } finally {
      setTimeout(() => setIsCrisisTriggering(false), 800);
    }
  };

  const handleApproveRemediation = async (id: string) => {
    try {
      await fetch('/api/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'mitigating' }),
      });
      await fetchData();
    } catch (e) {
      console.error('Failed to approve remediation:', e);
    }
  };

  const handleRejectRemediation = async (id: string) => {
    try {
      await fetch('/api/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'resolved' }),
      });
      await fetchData();
    } catch (e) {
      console.error('Failed to reject remediation:', e);
    }
  };

  // Update AI recommendations dynamically based on active status
  useEffect(() => {
    const active = incidents.filter((i) => i.status !== 'resolved');
    if (active.length > 0) {
      const newest = active[0];
      const statusMessages: Record<string, string> = {
        active: `⚠️ ALERT: "${newest.title}" detected on ${newest.affected_service}. Agent ${newest.assigned_agent} dispatched for autonomous triage.`,
        investigating: `🔍 Agent ${newest.assigned_agent} is performing root cause analysis on "${newest.title}". Correlating telemetry signals across affected regions.`,
        awaiting_approval: `🛡️ GOVERNANCE: Agent proposed automated hotfix for "${newest.title}". Awaiting operator approval before execution.`,
        mitigating: `🛠️ Autonomous remediation in progress for "${newest.title}". Agent ${newest.assigned_agent} deploying corrective actions on ${newest.affected_service}.`,
      };
      setAiRecommendation(statusMessages[newest.status] || statusMessages.active);
    } else if (alerts.length > 0) {
      setAiRecommendation(
        `Alert Flagged: ${alerts[0].message}. Swarm agents are executing diagnostic health sweeps.`
      );
    } else {
      setAiRecommendation(
        'Swarm behavior normal. Predictive analysis suggests 99.9% availability for the next 2 hours.'
      );
    }
  }, [incidents, alerts]);

  useEffect(() => {
    fetchData();
    // Poll every 4 seconds for real-time feel
    const interval = setInterval(() => fetchData(false), 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <MainLayout>
      {/* Crisis Flash Effect */}
      <AnimatePresence>
        {crisisFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-red-500 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-cs-blue-400/10 bg-gradient-to-b from-cs-dark-600/80 via-cs-dark-700/80 to-transparent backdrop-blur-xl">
        <div className="px-6 md:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-cs-dark-50 mb-2">
                  Command Center
                </h1>
                <p className="text-sm text-cs-dark-200 opacity-70 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cs-accent-success animate-pulse"></span>
                  All systems operational • Live Telemetry Active
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Simulate Crisis Button */}
                <motion.button
                  id="btn-simulate-crisis"
                  onClick={handleSimulateCrisis}
                  disabled={isCrisisTriggering}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-red-600/80 to-orange-600/80 border border-red-400/40 rounded-lg text-sm font-bold text-white hover:from-red-600 hover:to-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-red-900/30"
                >
                  {isCrisisTriggering ? (
                    <>
                      <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />
                      Triggering...
                    </>
                  ) : (
                    <>
                      <LucideIcons.Zap className="w-4 h-4" />
                      Simulate Crisis
                    </>
                  )}
                </motion.button>

                {/* Refresh Button */}
                <motion.button
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-cs-blue-500/20 border border-cs-blue-400/30 rounded-lg text-sm font-medium text-cs-blue-400 hover:bg-cs-blue-500/30 transition-all flex items-center gap-2"
                >
                  <LucideIcons.RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        className="p-6 md:p-8 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* AI Recommendations Banner */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden p-4 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 via-cs-dark-700/50 to-cs-dark-800/80 shadow-glow-purple"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 flex-shrink-0">
              <LucideIcons.BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">AI Swarm Advisory</span>
              <p className="text-sm font-semibold text-cs-dark-100 mt-0.5">{aiRecommendation}</p>
            </div>
          </div>
        </motion.div>

        {/* Top KPIs */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="System Health"
            value={metrics.system_health}
            unit="%"
            icon="activity"
            status={metrics.system_health > 80 ? 'good' : metrics.system_health > 60 ? 'warning' : 'critical'}
            trend={{ value: 8, isPositive: metrics.system_health > 80 }}
          />
          <MetricCard
            label="Active Incidents"
            value={metrics.total_incidents}
            icon="alert-triangle"
            status={metrics.total_incidents === 0 ? 'good' : metrics.total_incidents > 2 ? 'critical' : 'warning'}
            trend={{ value: metrics.total_incidents, isPositive: metrics.total_incidents === 0 }}
          />
          <MetricCard
            label="Avg Response Time"
            value={metrics.response_time_avg}
            unit="ms"
            icon="clock"
            status={metrics.response_time_avg < 250 ? 'good' : 'warning'}
            trend={{ value: 12, isPositive: metrics.response_time_avg < 250 }}
          />
          <MetricCard
            label="Request Rate"
            value={metrics.request_rate}
            unit="/min"
            icon="signal"
            status="good"
            trend={{ value: 15, isPositive: true }}
          />
        </motion.div>

        {/* System Health & Global Regions */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SystemHealth
              health={metrics.system_health}
              incidents={metrics.total_incidents}
              alerts={metrics.active_alerts}
              uptime={metrics.system_health > 80 ? 99.8 : 97.2}
            />
          </div>
          <GlobalCloudRegions activeIncidents={incidents} />
        </motion.div>

        {/* Telemetry Charts */}
        <motion.div variants={itemVariants}>
          <TelemetryChart data={telemetryData} />
        </motion.div>

        {/* Incidents & Alerts */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <IncidentFeed
              incidents={incidents}
              onApprove={handleApproveRemediation}
              onReject={handleRejectRemediation}
            />
          </div>

          {/* Alerts Panel */}
          <GlassCard className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-cs-dark-50 flex items-center gap-2">
                <LucideIcons.Bell className={`w-5 h-5 ${alerts.length > 0 ? 'text-orange-400 animate-pulse' : 'text-cs-dark-200 opacity-40'}`} />
                Active Alerts
              </h3>
              <p className="text-xs text-cs-dark-200 opacity-60 mt-1">
                {alerts.length} alerts
              </p>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-cs-dark-200 opacity-55 text-sm flex flex-col items-center gap-2">
                  <LucideIcons.ShieldCheck className="w-8 h-8 opacity-30" />
                  No active system alerts.
                </div>
              ) : (
                alerts.map((alert, idx) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-lg bg-cs-dark-700/50 border border-cs-blue-400/5 hover:border-cs-blue-400/20 transition-all"
                  >
                    <div className="flex items-start gap-2">
                      <LucideIcons.AlertCircle
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          alert.severity === 'critical'
                            ? 'text-cs-accent-danger'
                            : alert.severity === 'high'
                              ? 'text-orange-400'
                              : 'text-yellow-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-cs-dark-50 truncate">
                          {alert.message}
                        </p>
                        <p className="text-xs text-cs-dark-200 opacity-60 mt-0.5">
                          {(() => {
                            const now = new Date();
                            const date = new Date(alert.created_at);
                            const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
                            if (seconds < 60) return `${seconds}s ago`;
                            if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
                            return `${Math.floor(seconds / 3600)}h ago`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* AI Swarm Agents Preview */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-cs-dark-50 flex items-center gap-2">
                <LucideIcons.Cpu className="w-5 h-5 text-cs-blue-400" />
                AI Swarm Agents
              </h3>
              <p className="text-xs text-cs-dark-200 opacity-60 mt-1">
                {swarmAgents.length} agents active
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {swarmAgents.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-lg border border-cs-blue-400/10 bg-cs-dark-700/30 hover:bg-cs-dark-700/50 hover:border-cs-blue-400/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-cs-dark-50 truncate">{agent.agent_name}</h4>
                      <StatusBadge status={agent.status} size="sm" />
                    </div>
                    <p className="text-xs text-cs-dark-200 opacity-70 mb-3 line-clamp-2 min-h-[32px]">
                      {agent.current_task}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-cs-blue-400/5">
                    <span className="text-cs-dark-200 opacity-60">
                      Success: <span className="text-cs-accent-success font-semibold">{agent.success_rate}%</span>
                    </span>
                    <span className="text-cs-dark-200 opacity-60">
                      CPU: <span className="text-cs-blue-400 font-semibold">{agent.cpu_usage}%</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Azure Insights */}
        <motion.div variants={itemVariants}>
          <AzureInsightsSummary />
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
