'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/common/GlassCard';
import * as LucideIcons from 'lucide-react';

interface HeatmapRow {
  agent: string;
  [hour: string]: number | string;
}

interface AgentPerformanceMatrixProps {
  data: HeatmapRow[];
}

const HOURS = ['h00', 'h02', 'h04', 'h06', 'h08', 'h10', 'h12', 'h14', 'h16', 'h18', 'h20', 'h22'];
const HOUR_LABELS = ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];

function heatColor(value: number): string {
  if (value >= 98) return 'rgba(34,197,94,0.85)';   // green
  if (value >= 95) return 'rgba(34,197,94,0.55)';
  if (value >= 90) return 'rgba(245,158,11,0.60)';  // yellow
  if (value >= 85) return 'rgba(245,158,11,0.85)';
  if (value >= 80) return 'rgba(255,77,77,0.55)';   // red
  return 'rgba(255,77,77,0.85)';
}

function textColor(value: number): string {
  if (value >= 95) return 'text-cs-accent-success';
  if (value >= 85) return 'text-yellow-400';
  return 'text-cs-accent-danger';
}

export default function AgentPerformanceMatrix({ data }: AgentPerformanceMatrixProps) {
  const [hovered, setHovered] = useState<{ agent: string; hour: string; value: number } | null>(null);

  return (
    <GlassCard className="p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-cs-dark-50 flex items-center gap-2">
          <LucideIcons.LayoutGrid className="w-5 h-5 text-indigo-400" />
          Agent Success Rate — Hourly Heatmap
        </h3>
        <p className="text-xs text-cs-dark-200 opacity-50 mt-1">Hover a cell to see exact success rate</p>
      </div>

      {/* Hovered value */}
      <div className="h-6 mb-3">
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs"
          >
            <LucideIcons.Info className="w-3.5 h-3.5 text-cs-blue-400 opacity-70" />
            <span className="text-cs-dark-200 opacity-70">
              {hovered.agent} @ {hovered.hour.replace('h', '').padStart(2, '0')}:00 →{' '}
            </span>
            <span className={`font-bold ${textColor(hovered.value)}`}>{hovered.value}%</span>
          </motion.div>
        )}
      </div>

      {/* Hour header */}
      <div className="overflow-x-auto">
        <div className="min-w-[540px]">
          <div className="grid mb-1" style={{ gridTemplateColumns: '160px repeat(12, 1fr)' }}>
            <div />
            {HOUR_LABELS.map((h) => (
              <div key={h} className="text-center text-[10px] text-cs-dark-200 opacity-40 font-mono">{h}</div>
            ))}
          </div>

          {/* Rows */}
          {data.map((row, rowIdx) => (
            <motion.div
              key={row.agent}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIdx * 0.06 }}
              className="grid gap-1 mb-1"
              style={{ gridTemplateColumns: '160px repeat(12, 1fr)' }}
            >
              {/* Agent name */}
              <div className="flex items-center pr-3">
                <span className="text-xs text-cs-dark-100 opacity-80 truncate font-medium">{row.agent}</span>
              </div>

              {/* Cells */}
              {HOURS.map((h) => {
                const val = row[h] as number;
                return (
                  <motion.div
                    key={h}
                    whileHover={{ scale: 1.15 }}
                    onMouseEnter={() => setHovered({ agent: row.agent, hour: h, value: val })}
                    onMouseLeave={() => setHovered(null)}
                    className="relative h-8 rounded cursor-pointer transition-all duration-150 flex items-center justify-center"
                    style={{ backgroundColor: heatColor(val) }}
                    title={`${val}%`}
                  >
                    <span className="text-[9px] font-bold text-white opacity-90 select-none">{val}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-cs-blue-400/10 flex-wrap">
        <span className="text-xs text-cs-dark-200 opacity-40 mr-2">Success Rate:</span>
        {[
          { color: 'rgba(34,197,94,0.85)',  label: '≥ 98%' },
          { color: 'rgba(34,197,94,0.55)',  label: '95–97%' },
          { color: 'rgba(245,158,11,0.60)', label: '90–94%' },
          { color: 'rgba(245,158,11,0.85)', label: '85–89%' },
          { color: 'rgba(255,77,77,0.55)',  label: '80–84%' },
          { color: 'rgba(255,77,77,0.85)',  label: '< 80%'  },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1 text-xs text-cs-dark-200 opacity-55">
            <span className="w-4 h-4 rounded-sm flex-shrink-0" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
