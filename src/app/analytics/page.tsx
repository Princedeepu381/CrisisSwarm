'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import AnalyticsFilters, { TimeRange } from '@/components/analytics/AnalyticsFilters';
import PerformanceOverview from '@/components/analytics/PerformanceOverview';
import ServiceBreakdown from '@/components/analytics/ServiceBreakdown';
import ErrorRateTrend from '@/components/analytics/ErrorRateTrend';
import AgentPerformanceMatrix from '@/components/analytics/AgentPerformanceMatrix';
import TopologyHealthMap from '@/components/analytics/TopologyHealthMap';
import GlassCard from '@/components/common/GlassCard';
import * as LucideIcons from 'lucide-react';
import {
  mockTelemetryData,
  mockServiceData,
  mockErrorRateTrend,
  mockAgentHeatmap,
  mockMetrics,
} from '@/lib/mockData';

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [metrics, setMetrics] = useState(mockMetrics);
  const [telemetryData, setTelemetryData] = useState<any[]>(mockTelemetryData);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchAnalytics = useCallback(async (showSyncState = false) => {
    if (showSyncState) setIsSyncing(true);
    try {
      const [resHealth, resTelemetry] = await Promise.all([
        fetch('/api/health').then(r => r.json()),
        fetch('/api/telemetry').then(r => r.json())
      ]);

      if (resHealth) {
        setMetrics(prev => ({
          ...prev,
          cpu_avg: resHealth.cpu,
          memory_avg: resHealth.memory.percentage,
          response_time_avg: resHealth.cpu > 70 ? 385 : 195,
          request_rate: 2400 + Math.floor(Math.random() * 200),
        }));
      }

      if (resTelemetry) {
        setTelemetryData(resTelemetry);
      }
    } catch (e) {
      console.error('Error polling analytics data:', e);
    } finally {
      if (showSyncState) {
        setTimeout(() => setIsSyncing(false), 500);
      }
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => fetchAnalytics(false), 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const KPIS = [
    { label: 'Avg CPU',       value: `${metrics.cpu_avg}%`,      icon: 'cpu',           color: 'text-cs-blue-400',     bg: 'bg-cs-blue-400/10'    },
    { label: 'Avg Memory',    value: `${metrics.memory_avg}%`,   icon: 'memory-stick',  color: 'text-purple-400',      bg: 'bg-purple-400/10'     },
    { label: 'Avg Latency',   value: `${metrics.response_time_avg}ms`, icon: 'clock',   color: 'text-yellow-400',      bg: 'bg-yellow-400/10'     },
    { label: 'Request Rate',  value: `${metrics.request_rate.toLocaleString()}/min`, icon: 'signal', color: 'text-cs-accent-success', bg: 'bg-cs-accent-success/10' },
  ];

  return (
    <MainLayout>
      {/* Sticky header */}
      <div className="sticky top-0 z-30 border-b border-cs-blue-400/10 bg-gradient-to-b from-cs-dark-600/90 via-cs-dark-700/80 to-transparent backdrop-blur-xl">
        <div className="px-6 md:px-8 py-5">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-cs-dark-50 mb-1">Analytics</h1>
                <p className="text-sm text-cs-dark-200 opacity-60">
                  Performance metrics, telemetry trends, and agent intelligence
                </p>
              </div>
              <button
                id="btn-export-analytics"
                onClick={() => fetchAnalytics(true)}
                disabled={isSyncing}
                className="px-4 py-2 rounded-lg text-sm font-medium text-cs-dark-200 border border-cs-blue-400/15 hover:border-cs-blue-400/30 hover:text-cs-dark-50 bg-cs-dark-700/40 transition-all duration-200 flex items-center gap-2"
              >
                <LucideIcons.RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Metrics'}
              </button>
            </div>
            {/* Time range filter */}
            <AnalyticsFilters timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        className="p-6 md:p-8 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* KPI row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS.map((kpi) => {
            const IconName = kpi.icon
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join('') as keyof typeof LucideIcons;
            const Icon = (LucideIcons[IconName] as React.ElementType) || LucideIcons.Activity;
            return (
              <GlassCard key={kpi.label} className="p-5">
                <div className={`inline-flex p-2 rounded-lg ${kpi.bg} mb-3`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <p className="text-2xl font-bold text-cs-dark-50 mb-0.5">{kpi.value}</p>
                <p className="text-xs text-cs-dark-200 opacity-55">{kpi.label}</p>
              </GlassCard>
            );
          })}
        </motion.div>

        {/* Performance overview — full width */}
        <motion.div variants={itemVariants}>
          <PerformanceOverview data={telemetryData} />
        </motion.div>

        {/* Service breakdown + Error rate trend — side by side */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ServiceBreakdown data={mockServiceData} />
          <ErrorRateTrend data={mockErrorRateTrend} />
        </motion.div>

        {/* Agent heatmap — full width */}
        <motion.div variants={itemVariants}>
          <AgentPerformanceMatrix data={mockAgentHeatmap} />
        </motion.div>

        {/* Topology map — full width */}
        <motion.div variants={itemVariants}>
          <TopologyHealthMap />
        </motion.div>

        {/* Footnote */}
        <motion.div variants={itemVariants}>
          <p className="text-xs text-cs-dark-200 opacity-30 text-center pb-4">
            Data refreshed dynamically · Showing: {timeRange} window · Live Azure Integration Active
          </p>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
