'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAzureHealth, useAzureLatencyHistory, useAzureErrorTrigger } from '@/hooks/useAzureData';
import AzureConnectionBadge from '@/components/common/AzureConnectionBadge';
import GlassCard from '@/components/common/GlassCard';
import * as LucideIcons from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Latency Sparkline ────────────────────────────────────────────────────────
function LatencySparkline({ data }: { data: { time: string; latencyMs: number }[] }) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-16 text-xs text-cs-dark-200 opacity-40">
        Collecting data…
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={64}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="latency-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00C2FF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00C2FF" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,194,255,0.06)" />
        <XAxis dataKey="time" hide />
        <YAxis hide />
        <Tooltip
          contentStyle={{ background: 'rgba(8,13,23,0.95)', border: '1px solid rgba(0,194,255,0.2)', borderRadius: 8, fontSize: 11 }}
          labelStyle={{ color: 'rgba(209,222,235,0.5)' }}
          itemStyle={{ color: '#00C2FF' }}
          formatter={(v: number) => [`${v}ms`, 'Latency']}
        />
        <Area type="monotone" dataKey="latencyMs" stroke="#00C2FF" strokeWidth={1.5} fill="url(#latency-grad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-cs-blue-400/5 last:border-0">
      <span className="text-xs text-cs-dark-200 opacity-55 flex-shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-cs-dark-50 truncate text-right ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AzureMonitorPanel() {
  const { status, health, root, latencyMs, lastChecked, error, isLoading, refresh } = useAzureHealth(30000);
  const latencyHistory = useAzureLatencyHistory(15000);
  const { trigger, triggered, result: triggerResult } = useAzureErrorTrigger();
  const [showRaw, setShowRaw] = useState(false);

  // Derive health fields — backend may return different shapes
  const uptimeSecs = health?.uptime ?? null;
  const uptimeStr = uptimeSecs !== null
    ? uptimeSecs < 3600
      ? `${Math.round(uptimeSecs / 60)}m`
      : `${Math.floor(uptimeSecs / 3600)}h ${Math.round((uptimeSecs % 3600) / 60)}m`
    : '—';

  const memPct = health?.memory?.percentage ?? null;
  const cpuPct = health?.cpu ?? null;
  const backendStatus = health?.status ?? (status === 'offline' ? 'unreachable' : 'unknown');
  const backendVersion = health?.version ?? root?.version ?? '—';

  return (
    <GlassCard className="p-6 space-y-5" hover={false}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-cs-blue-400/15 border border-cs-blue-400/25">
              <LucideIcons.CloudCog className="w-4 h-4 text-cs-blue-400" />
            </div>
            <h3 className="text-base font-bold text-cs-dark-50">Azure Monitor Panel</h3>
            {isLoading && <LucideIcons.Loader2 className="w-4 h-4 text-cs-blue-400 animate-spin" />}
          </div>
          <p className="text-xs text-cs-dark-200 opacity-50">
            Real-time connection to Serverless API
          </p>
        </div>

        <AzureConnectionBadge
          status={status}
          latencyMs={latencyMs}
          lastChecked={lastChecked}
          onRefresh={refresh}
        />
      </div>

      {/* Latency sparkline */}
      <div>
        <p className="text-xs text-cs-dark-200 opacity-50 mb-2 flex items-center gap-1">
          <LucideIcons.Activity className="w-3.5 h-3.5" />
          Backend Latency (last {latencyHistory.length} checks)
        </p>
        <LatencySparkline data={latencyHistory} />
        {latencyMs !== null && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-cs-dark-200 opacity-40">Latest: {latencyMs}ms</span>
            <span className={`text-[10px] font-bold ${latencyMs < 500 ? 'text-cs-accent-success' : latencyMs < 2000 ? 'text-yellow-400' : 'text-cs-accent-danger'}`}>
              {latencyMs < 500 ? 'Excellent' : latencyMs < 2000 ? 'Acceptable' : 'High'}
            </span>
          </div>
        )}
      </div>

      {/* Health fields */}
      <div className="bg-cs-dark-700/40 rounded-xl border border-cs-blue-400/8 px-4 py-2">
        <InfoRow label="Backend Status" value={
          <span className={backendStatus === 'healthy' ? 'text-cs-accent-success' : backendStatus === 'unreachable' ? 'text-cs-dark-200 opacity-50' : 'text-orange-400'}>
            {backendStatus.charAt(0).toUpperCase() + backendStatus.slice(1)}
          </span>
        } />
        <InfoRow label="Uptime" value={uptimeStr} />
        <InfoRow label="Memory Usage" value={memPct !== null ? `${Math.round(memPct)}%` : '—'} />
        <InfoRow label="CPU Usage" value={cpuPct !== null ? `${Math.round(cpuPct)}%` : '—'} />
        <InfoRow label="Version" value={backendVersion} mono />
        <InfoRow label="Environment" value={health?.environment ?? root?.environment ?? '—'} />
        <InfoRow label="Region" value="Southeast Asia (Azure)" />
        <InfoRow
          label="Endpoint"
          value={
            <span className="text-cs-blue-400 font-mono">
              /api/health
            </span>
          }
        />
      </div>

      {/* Available endpoints */}
      <div>
        <p className="text-xs text-cs-dark-200 opacity-50 mb-2 uppercase tracking-widest font-semibold">
          Live Endpoints
        </p>
        <div className="space-y-1.5">
          {[
            { method: 'GET', path: '/',       label: 'App Status',      active: true  },
            { method: 'GET', path: '/health', label: 'Health Check',    active: true  },
            { method: 'GET', path: '/error',  label: 'Alert Simulator', active: true  },
            { method: 'GET', path: '/api/incidents', label: 'Incidents API', active: true },
            { method: 'GET', path: '/api/telemetry', label: 'Telemetry API', active: true },
            { method: 'GET', path: '/api/agents',    label: 'Agents API',    active: true },
          ].map((ep) => (
            <div key={ep.path} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${ep.active ? 'bg-cs-dark-700/40' : 'bg-cs-dark-800/30 opacity-50'}`}>
              <span className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${ep.active ? 'bg-cs-accent-success/20 text-cs-accent-success' : 'bg-cs-dark-700 text-cs-dark-200'}`}>
                {ep.method}
              </span>
              <span className={`font-mono ${ep.active ? 'text-cs-dark-100' : 'text-cs-dark-200'}`}>{ep.path}</span>
              <span className="text-cs-dark-200 opacity-50 ml-auto">{ep.label}</span>
              {!ep.active && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-400/15 text-yellow-400 font-bold">SOON</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Alert Simulator */}
      <div className="pt-3 border-t border-cs-blue-400/10">
        <p className="text-xs text-cs-dark-200 opacity-50 mb-3 uppercase tracking-widest font-semibold">
          Azure Alert Testing
        </p>

        <AnimatePresence mode="wait">
          {triggerResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 p-3 rounded-lg bg-orange-400/10 border border-orange-400/30 text-xs text-orange-400 mb-3"
            >
              <LucideIcons.AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{triggerResult}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex gap-2 flex-wrap">
          <motion.button
            id="btn-trigger-error"
            whileTap={{ scale: 0.97 }}
            onClick={trigger}
            disabled={triggered}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold
              bg-cs-accent-danger/15 border border-cs-accent-danger/30 text-cs-accent-danger
              hover:bg-cs-accent-danger/25 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200"
          >
            {triggered ? (
              <LucideIcons.Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LucideIcons.Zap className="w-3.5 h-3.5" />
            )}
            {triggered ? 'Triggering…' : 'Trigger /error Alert'}
          </motion.button>

          <button
            id="btn-toggle-raw"
            onClick={() => setShowRaw((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold
              border border-cs-blue-400/20 text-cs-dark-200 hover:text-cs-dark-50
              hover:bg-cs-dark-700/40 transition-all duration-200"
          >
            <LucideIcons.Code2 className="w-3.5 h-3.5" />
            {showRaw ? 'Hide' : 'Show'} Raw JSON
          </button>
        </div>

        <AnimatePresence>
          {showRaw && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <pre className="text-[10px] font-mono text-cs-blue-400 opacity-70 bg-cs-dark-800/60 border border-cs-blue-400/10 rounded-lg p-3 overflow-auto max-h-48 leading-relaxed">
                {JSON.stringify({ health, root }, null, 2)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="text-[10px] text-cs-accent-danger opacity-60 mt-2 font-mono">
            Last error: {error}
          </p>
        )}
      </div>
    </GlassCard>
  );
}
