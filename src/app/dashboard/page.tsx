'use client';

import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import MetricCard from '@/components/common/MetricCard';
import SystemHealth from '@/components/dashboard/SystemHealth';
import IncidentFeed from '@/components/dashboard/IncidentFeed';
import TelemetryChart from '@/components/dashboard/TelemetryChart';
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

export default function Dashboard() {
  return (
    <MainLayout>
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
                  <div className="w-2 h-2 rounded-full bg-cs-accent-success animate-pulse"></div>
                  All systems operational • {new Date().toLocaleTimeString()}
                </p>
              </div>
              <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
                <button className="px-4 py-2 bg-cs-blue-500/20 border border-cs-blue-400/30 rounded-lg text-sm font-medium text-cs-blue-400 hover:bg-cs-blue-500/30 transition-all">
                  <LucideIcons.RefreshCw className="w-4 h-4 inline mr-2" />
                  Refresh
                </button>
              </motion.div>
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
        {/* Top KPIs */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="System Health"
            value={mockMetrics.system_health}
            unit="%"
            icon="activity"
            status={mockMetrics.system_health > 80 ? 'good' : mockMetrics.system_health > 60 ? 'warning' : 'critical'}
            trend={{ value: 8, isPositive: true }}
          />
          <MetricCard
            label="Active Incidents"
            value={mockMetrics.total_incidents}
            icon="alert-triangle"
            status="warning"
            trend={{ value: 25, isPositive: false }}
          />
          <MetricCard
            label="Avg Response Time"
            value={mockMetrics.response_time_avg}
            unit="ms"
            icon="clock"
            status="good"
            trend={{ value: 12, isPositive: true }}
          />
          <MetricCard
            label="Request Rate"
            value={mockMetrics.request_rate}
            unit="/min"
            icon="signal"
            status="good"
            trend={{ value: 15, isPositive: true }}
          />
        </motion.div>

        {/* System Health & Incidents Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Health Circle */}
          <div className="lg:col-span-2">
            <SystemHealth
              health={mockMetrics.system_health}
              incidents={mockMetrics.total_incidents}
              alerts={mockMetrics.active_alerts}
              uptime={99.8}
            />
          </div>

          {/* Azure Insights Summary */}
          <AzureInsightsSummary />
        </motion.div>

        {/* Telemetry Charts */}
        <motion.div variants={itemVariants}>
          <TelemetryChart data={mockTelemetryData} />
        </motion.div>

        {/* Incidents & Alerts */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incident Feed */}
          <div className="lg:col-span-2">
            <IncidentFeed incidents={mockIncidents} />
          </div>

          {/* Alerts Panel */}
          <GlassCard className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-cs-dark-50 flex items-center gap-2">
                <LucideIcons.Bell className="w-5 h-5 text-orange-400 animate-pulse" />
                Active Alerts
              </h3>
              <p className="text-xs text-cs-dark-200 opacity-60 mt-1">
                {mockAlerts.length} alerts
              </p>
            </div>

            <div className="space-y-2">
              {mockAlerts.map((alert, idx) => (
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
              ))}
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
                {mockSwarmAgents.length} agents ready
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockSwarmAgents.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-lg border border-cs-blue-400/10 bg-cs-dark-700/30 hover:bg-cs-dark-700/50 hover:border-cs-blue-400/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-cs-dark-50">{agent.agent_name}</h4>
                    <StatusBadge status={agent.status} size="sm" />
                  </div>
                  <p className="text-xs text-cs-dark-200 opacity-70 mb-3 line-clamp-2">
                    {agent.current_task}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cs-dark-200 opacity-60">
                      Success: <span className="text-cs-accent-success font-semibold">{agent.success_rate}%</span>
                    </span>
                    <span className="text-cs-dark-200 opacity-60">
                      Latency: <span className="text-cs-blue-400 font-semibold">{agent.response_time}ms</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
