'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import GlassCard from '@/components/common/GlassCard';
import * as LucideIcons from 'lucide-react';

interface DataPoint {
  time: string;
  cpu: number;
  memory: number;
  responseTime: number;
  errorRate: number;
}

interface PerformanceOverviewProps {
  data: DataPoint[];
}

const SERIES = [
  { key: 'cpu',          label: 'CPU %',           color: '#00C2FF', gradientId: 'grad-cpu'  },
  { key: 'memory',       label: 'Memory %',        color: '#818CF8', gradientId: 'grad-mem'  },
  { key: 'responseTime', label: 'Response (ms/10)', color: '#F59E0B', gradientId: 'grad-rt'  },
];

// Custom tooltip
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-cs-dark-600/90 border border-cs-blue-400/20 rounded-xl p-3 backdrop-blur-xl shadow-xl text-xs">
      <p className="text-cs-dark-200 opacity-60 mb-2 font-mono">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-cs-dark-100 opacity-80">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function PerformanceOverview({ data }: PerformanceOverviewProps) {
  const [hidden, setHidden] = useState<string[]>([]);

  // Normalize responseTime /10 so it fits on same 0-100 axis
  const normalizedData = data.map((d) => ({
    ...d,
    responseTime: Math.round(d.responseTime / 10),
  }));

  function toggleSeries(key: string) {
    setHidden((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-cs-dark-50 flex items-center gap-2">
            <LucideIcons.Activity className="w-5 h-5 text-cs-blue-400" />
            System Performance — 24h
          </h3>
          <p className="text-xs text-cs-dark-200 opacity-50 mt-1">CPU · Memory · Response Time overlay</p>
        </div>

        {/* Series toggles */}
        <div className="flex gap-2 flex-wrap">
          {SERIES.map((s) => (
            <button
              key={s.key}
              id={`toggle-series-${s.key}`}
              onClick={() => toggleSeries(s.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200
                ${hidden.includes(s.key)
                  ? 'border-cs-blue-400/10 text-cs-dark-200 opacity-40'
                  : 'border-opacity-40 opacity-100'
                }
              `}
              style={!hidden.includes(s.key) ? { borderColor: s.color + '60', color: s.color, backgroundColor: s.color + '15' } : {}}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hidden.includes(s.key) ? 'currentColor' : s.color }} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={normalizedData} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
          <defs>
            {SERIES.map((s) => (
              <linearGradient key={s.gradientId} id={s.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={s.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0}    />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,194,255,0.06)" />
          <XAxis dataKey="time" tick={{ fill: 'rgba(209,222,235,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: 'rgba(209,222,235,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />

          {/* Threshold markers */}
          <ReferenceLine y={80} stroke="rgba(255,77,77,0.4)" strokeDasharray="4 4" label={{ value: '80%', fill: 'rgba(255,77,77,0.6)', fontSize: 10 }} />
          <ReferenceLine y={20} stroke="rgba(0,194,255,0.25)" strokeDasharray="4 4" label={{ value: '20ms×10', fill: 'rgba(0,194,255,0.4)', fontSize: 10 }} />

          {SERIES.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={hidden.includes(s.key) ? 0 : 2}
              fill={`url(#${s.gradientId})`}
              fillOpacity={hidden.includes(s.key) ? 0 : 1}
              dot={false}
              activeDot={hidden.includes(s.key) ? false : { r: 4, fill: s.color, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
