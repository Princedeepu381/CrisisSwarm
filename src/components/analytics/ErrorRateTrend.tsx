'use client';

import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import GlassCard from '@/components/common/GlassCard';
import * as LucideIcons from 'lucide-react';

interface DataPoint {
  time: string;
  errorRate: number;
  requests: number;
}

interface ErrorRateTrendProps {
  data: DataPoint[];
}

const ANOMALY_THRESHOLD = 0.8;

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-cs-dark-600/95 border border-cs-blue-400/20 rounded-xl p-3 backdrop-blur-xl shadow-xl text-xs space-y-1.5">
      <p className="text-cs-dark-200 opacity-60 font-mono mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-cs-dark-200 opacity-70">{p.name}</span>
          </div>
          <span style={{ color: p.color }} className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// Custom dot that highlights anomalies
function AnomalyDot(props: { cx?: number; cy?: number; payload?: DataPoint; value?: number }) {
  const { cx, cy, payload } = props;
  if (!payload || payload.errorRate < ANOMALY_THRESHOLD) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#FF4D4D" fillOpacity={0.3} />
      <circle cx={cx} cy={cy} r={3} fill="#FF4D4D" />
    </g>
  );
}

export default function ErrorRateTrend({ data }: ErrorRateTrendProps) {
  const maxErrors = Math.max(...data.map((d) => d.errorRate));

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-cs-dark-50 flex items-center gap-2">
            <LucideIcons.TrendingUp className="w-5 h-5 text-cs-accent-danger" />
            Error Rate Trend
          </h3>
          <p className="text-xs text-cs-dark-200 opacity-50 mt-1">Error % vs request volume — dual axis</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-cs-accent-danger opacity-80" />
            <span className="text-cs-dark-200 opacity-60">Error Rate %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-cs-blue-400/40" />
            <span className="text-cs-dark-200 opacity-60">Requests</span>
          </div>
          {maxErrors >= ANOMALY_THRESHOLD && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cs-accent-danger" />
              <span className="text-cs-accent-danger opacity-80">Anomaly</span>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 5, right: 32, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-requests" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#00C2FF" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#00C2FF" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,194,255,0.06)" />
          <XAxis dataKey="time" tick={{ fill: 'rgba(209,222,235,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />

          {/* Left Y — error rate */}
          <YAxis
            yAxisId="left"
            domain={[0, Math.max(2, maxErrors + 0.5)]}
            tick={{ fill: 'rgba(255,77,77,0.7)', fontSize: 11 }}
            axisLine={false} tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />

          {/* Right Y — request count */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: 'rgba(0,194,255,0.7)', fontSize: 11 }}
            axisLine={false} tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
          />

          <Tooltip content={<CustomTooltip />} />

          <ReferenceLine yAxisId="left" y={ANOMALY_THRESHOLD} stroke="rgba(255,77,77,0.4)" strokeDasharray="4 4" />

          {/* Requests — bars */}
          <Bar yAxisId="right" dataKey="requests" name="Requests" fill="url(#grad-requests)" stroke="rgba(0,194,255,0.3)" radius={[3, 3, 0, 0]} />

          {/* Error rate — line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="errorRate"
            name="Error Rate %"
            stroke="#FF4D4D"
            strokeWidth={2.5}
            dot={<AnomalyDot />}
            activeDot={{ r: 5, fill: '#FF4D4D', strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
