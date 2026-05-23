'use client';

import GlassCard from '@/components/common/GlassCard';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as LucideIcons from 'lucide-react';

interface TelemetryChartProps {
  data: Array<{ time: string; cpu: number; memory: number; responseTime: number }>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cs-dark-700 border border-cs-blue-400/30 rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold text-cs-dark-50">{payload[0].payload.time}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)}
            {entry.name === 'Response Time' ? 'ms' : '%'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TelemetryChart({ data }: TelemetryChartProps) {
  return (
    <div className="space-y-6">
      {/* CPU & Memory */}
      <GlassCard className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-cs-dark-50 flex items-center gap-2">
            <LucideIcons.Activity className="w-5 h-5 text-cs-blue-400" />
            Resource Utilization
          </h3>
          <p className="text-xs text-cs-dark-200 opacity-60 mt-1">24-hour trend</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C2FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00C2FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0078D4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0078D4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 120, 212, 0.1)" />
            <XAxis dataKey="time" stroke="rgba(245, 247, 250, 0.3)" style={{ fontSize: '12px' }} />
            <YAxis stroke="rgba(245, 247, 250, 0.3)" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cpu"
              stroke="#00C2FF"
              fillOpacity={1}
              fill="url(#colorCpu)"
              name="CPU"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="memory"
              stroke="#0078D4"
              fillOpacity={1}
              fill="url(#colorMemory)"
              name="Memory"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Response Time */}
      <GlassCard className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-cs-dark-50 flex items-center gap-2">
            <LucideIcons.TrendingUp className="w-5 h-5 text-cs-accent-success" />
            Response Time
          </h3>
          <p className="text-xs text-cs-dark-200 opacity-60 mt-1">Average latency</p>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <defs>
              <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 120, 212, 0.1)" />
            <XAxis dataKey="time" stroke="rgba(245, 247, 250, 0.3)" style={{ fontSize: '12px' }} />
            <YAxis stroke="rgba(245, 247, 250, 0.3)" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="responseTime"
              stroke="#22C55E"
              strokeWidth={3}
              dot={false}
              name="Response Time"
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
