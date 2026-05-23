'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

interface AnalyticsFiltersProps {
  timeRange: TimeRange;
  onTimeRangeChange: (r: TimeRange) => void;
}

const RANGES: { value: TimeRange; label: string }[] = [
  { value: '1h',  label: 'Last 1h'  },
  { value: '6h',  label: 'Last 6h'  },
  { value: '24h', label: 'Last 24h' },
  { value: '7d',  label: 'Last 7d'  },
  { value: '30d', label: 'Last 30d' },
];

export default function AnalyticsFilters({ timeRange, onTimeRangeChange }: AnalyticsFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 flex-wrap"
    >
      <div className="flex items-center gap-1.5 mr-2">
        <LucideIcons.Calendar className="w-4 h-4 text-cs-blue-400 opacity-70" />
        <span className="text-xs text-cs-dark-200 opacity-60 font-medium uppercase tracking-widest">Range</span>
      </div>

      <div className="flex gap-1.5 p-1 rounded-xl bg-cs-dark-700/50 border border-cs-blue-400/10">
        {RANGES.map((r) => (
          <button
            key={r.value}
            id={`time-range-${r.value}`}
            onClick={() => onTimeRangeChange(r.value)}
            className={`
              relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
              ${timeRange === r.value
                ? 'text-white bg-cs-blue-500/80 shadow-glow-blue border border-cs-blue-400/30'
                : 'text-cs-dark-200 opacity-60 hover:opacity-90 hover:text-cs-dark-50'
              }
            `}
          >
            {r.label}
            {timeRange === r.value && (
              <motion.span
                layoutId="range-indicator"
                className="absolute inset-0 rounded-lg bg-cs-blue-500/20 -z-10"
              />
            )}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cs-accent-success animate-pulse" />
        <span className="text-xs text-cs-dark-200 opacity-50">Live data</span>
      </div>
    </motion.div>
  );
}
