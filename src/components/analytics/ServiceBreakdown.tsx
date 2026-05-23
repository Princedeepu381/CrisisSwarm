'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import GlassCard from '@/components/common/GlassCard';
import * as LucideIcons from 'lucide-react';

interface Service {
  service: string;
  requests: number;
  errors: number;
  latency: number;
  health: number;
}

interface ServiceBreakdownProps {
  data: Service[];
}

function healthColor(h: number) {
  if (h >= 95) return '#22C55E';
  if (h >= 85) return '#F59E0B';
  return '#FF4D4D';
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { payload: Service; value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-cs-dark-600/95 border border-cs-blue-400/20 rounded-xl p-3 backdrop-blur-xl shadow-xl text-xs space-y-1.5">
      <p className="font-bold text-cs-dark-50 mb-2">{d.service || label}</p>
      <div className="flex items-center justify-between gap-6">
        <span className="text-cs-dark-200 opacity-60">Health</span>
        <span style={{ color: healthColor(d.health) }} className="font-bold">{d.health}%</span>
      </div>
      <div className="flex items-center justify-between gap-6">
        <span className="text-cs-dark-200 opacity-60">Requests</span>
        <span className="text-cs-blue-400 font-bold">{d.requests?.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between gap-6">
        <span className="text-cs-dark-200 opacity-60">Errors</span>
        <span className="text-cs-accent-danger font-bold">{d.errors}</span>
      </div>
      <div className="flex items-center justify-between gap-6">
        <span className="text-cs-dark-200 opacity-60">Latency</span>
        <span className="text-yellow-400 font-bold">{d.latency}ms</span>
      </div>
    </div>
  );
}

export default function ServiceBreakdown({ data }: ServiceBreakdownProps) {
  return (
    <GlassCard className="p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-cs-dark-50 flex items-center gap-2">
          <LucideIcons.Layers className="w-5 h-5 text-purple-400" />
          Service Health Breakdown
        </h3>
        <p className="text-xs text-cs-dark-200 opacity-50 mt-1">Health score per service</p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,194,255,0.05)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(209,222,235,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="service" width={120} tick={{ fill: 'rgba(209,222,235,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,120,212,0.08)' }} />
          <Bar dataKey="health" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {data.map((entry) => (
              <Cell
                key={entry.service}
                fill={healthColor(entry.health)}
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-cs-blue-400/10 flex-wrap">
        {[
          { color: '#22C55E', label: '≥ 95% Healthy'  },
          { color: '#F59E0B', label: '85–95% Warning'  },
          { color: '#FF4D4D', label: '< 85% Critical'  },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-cs-dark-200 opacity-60">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color, opacity: 0.85 }} />
            {l.label}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
