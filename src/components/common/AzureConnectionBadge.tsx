'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { ConnectionState } from '@/lib/azureApi';

interface AzureConnectionBadgeProps {
  status: ConnectionState;
  latencyMs: number | null;
  lastChecked: Date | null;
  onRefresh?: () => void;
  compact?: boolean;
}

const stateConfig: Record<ConnectionState, {
  label: string;
  dot: string;
  text: string;
  border: string;
  bg: string;
  icon: keyof typeof LucideIcons;
  pulse: boolean;
}> = {
  connecting: {
    label: 'Connecting',
    dot: 'bg-yellow-400',
    text: 'text-yellow-400',
    border: 'border-yellow-400/30',
    bg: 'bg-yellow-400/10',
    icon: 'Loader2',
    pulse: true,
  },
  live: {
    label: 'Azure Live',
    dot: 'bg-cs-accent-success',
    text: 'text-cs-accent-success',
    border: 'border-cs-accent-success/30',
    bg: 'bg-cs-accent-success/10',
    icon: 'Cloud',
    pulse: true,
  },
  degraded: {
    label: 'Degraded',
    dot: 'bg-orange-400',
    text: 'text-orange-400',
    border: 'border-orange-400/30',
    bg: 'bg-orange-400/10',
    icon: 'AlertTriangle',
    pulse: true,
  },
  offline: {
    label: 'Backend Offline',
    dot: 'bg-cs-dark-200',
    text: 'text-cs-dark-200',
    border: 'border-cs-dark-200/20',
    bg: 'bg-cs-dark-700/30',
    icon: 'CloudOff',
    pulse: false,
  },
};

export default function AzureConnectionBadge({
  status,
  latencyMs,
  lastChecked,
  onRefresh,
  compact = false,
}: AzureConnectionBadgeProps) {
  const cfg = stateConfig[status];
  const IconComp = (LucideIcons[cfg.icon] as React.ElementType) || LucideIcons.Cloud;

  function fmtTime(d: Date | null) {
    if (!d) return '—';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${cfg.border} ${cfg.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
        <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
        {latencyMs !== null && status === 'live' && (
          <span className="text-xs text-cs-dark-200 opacity-50">{latencyMs}ms</span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${cfg.border} ${cfg.bg} backdrop-blur-sm`}
    >
      {/* Status icon */}
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
        <IconComp className={`w-4 h-4 ${cfg.text} ${status === 'connecting' ? 'animate-spin' : ''}`} />
      </div>

      {/* Labels */}
      <div className="min-w-0">
        <div className={`text-xs font-bold ${cfg.text} leading-tight`}>{cfg.label}</div>
        {!compact && (
          <div className="text-[10px] text-cs-dark-200 opacity-50 leading-tight mt-0.5 whitespace-nowrap">
            {status === 'offline'
              ? 'Showing cached data'
              : `${latencyMs !== null ? `${latencyMs}ms · ` : ''}Last: ${fmtTime(lastChecked)}`
            }
          </div>
        )}
      </div>

      {/* Azure logo text */}
      <div className="hidden sm:flex items-center gap-1 ml-1 pl-3 border-l border-current border-opacity-20">
        <LucideIcons.CloudCog className={`w-3.5 h-3.5 ${cfg.text} opacity-60`} />
        <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.text} opacity-60`}>
          Azure
        </span>
      </div>

      {/* Refresh button */}
      {onRefresh && (
        <button
          id="btn-azure-refresh"
          onClick={onRefresh}
          className={`ml-1 p-1 rounded-md hover:bg-white/5 transition-all ${cfg.text} opacity-60 hover:opacity-100`}
          title="Refresh connection"
        >
          <LucideIcons.RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}
