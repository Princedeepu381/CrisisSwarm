'use client';

import { motion } from 'framer-motion';
import { useAzureHealth } from '@/hooks/useAzureData';
import AzureConnectionBadge from '@/components/common/AzureConnectionBadge';
import GlassCard from '@/components/common/GlassCard';
import * as LucideIcons from 'lucide-react';

export default function AzureInsightsSummary() {
  const { status, health, latencyMs, lastChecked, isLoading, refresh } = useAzureHealth(30000);

  const isLive = status === 'live' || status === 'degraded';

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-base font-semibold text-cs-dark-50 flex items-center gap-2">
          <LucideIcons.CloudCog className="w-5 h-5 text-cs-blue-400" />
          Serverless API
        </h3>
        <AzureConnectionBadge
          status={status}
          latencyMs={latencyMs}
          lastChecked={lastChecked}
          onRefresh={refresh}
          compact
        />
      </div>

      {/* Live metrics row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          {
            label: 'Backend',
            value: isLoading ? '…' : isLive ? (health?.status ?? 'healthy') : 'offline',
            color: isLive ? 'text-cs-accent-success' : 'text-cs-dark-200',
            icon: 'Heart',
          },
          {
            label: 'Latency',
            value: latencyMs !== null ? `${latencyMs}ms` : '—',
            color: latencyMs !== null && latencyMs < 500 ? 'text-cs-accent-success' : latencyMs !== null && latencyMs < 2000 ? 'text-yellow-400' : 'text-cs-dark-200',
            icon: 'Gauge',
          },
          {
            label: 'Memory',
            value: health?.memory?.percentage != null ? `${Math.round(health.memory.percentage)}%` : '—',
            color: 'text-cs-blue-400',
            icon: 'MemoryStick',
          },
        ].map((m) => {
          const Icon = (LucideIcons[m.icon as keyof typeof LucideIcons] as React.ElementType) ?? LucideIcons.Circle;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2.5 rounded-lg bg-cs-dark-700/40 border border-cs-blue-400/8 text-center"
            >
              <Icon className={`w-4 h-4 mx-auto mb-1 ${m.color}`} />
              <p className={`text-sm font-bold ${m.color} capitalize`}>{m.value}</p>
              <p className="text-[10px] text-cs-dark-200 opacity-50 mt-0.5">{m.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Stack info */}
      <div className="space-y-1.5">
        {[
          { label: 'Runtime',   value: 'Next.js Serverless API' },
          { label: 'Platform',  value: 'Azure Static Web Apps' },
          { label: 'Telemetry', value: 'Dynamic Server Diagnostics' },
          { label: 'Alerting',  value: 'AI Predictive Engine' },
          { label: 'Region',    value: 'Southeast Asia'       },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between text-xs">
            <span className="text-cs-dark-200 opacity-50">{row.label}</span>
            <span className="text-cs-dark-100 opacity-80 font-medium">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Backend Info */}
      <div className="mt-4 pt-3 border-t border-cs-blue-400/10">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-cs-blue-400 opacity-75">
          <LucideIcons.CheckCircle className="w-3.5 h-3.5 text-cs-accent-success" />
          <span>Serverless API routes active</span>
        </div>
      </div>

      {/* Uptime indicator */}
      {health?.uptime != null && (
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-cs-dark-200 opacity-40 mb-1">
            <span>Backend Uptime</span>
            <span>{Math.floor(health.uptime / 3600)}h {Math.round((health.uptime % 3600) / 60)}m</span>
          </div>
          <div className="w-full h-1 rounded-full bg-cs-dark-700">
            <div className="h-1 rounded-full bg-cs-accent-success" style={{ width: '100%' }} />
          </div>
        </div>
      )}
    </GlassCard>
  );
}
