'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import * as LucideIcons from 'lucide-react';

interface SystemHealthProps {
  health: number;
  incidents: number;
  alerts: number;
  uptime: number;
}

const getStatIcon = (iconName: string): React.ComponentType<{ className?: string }> => {
  switch (iconName) {
    case 'alert-circle':
      return LucideIcons.AlertCircle;
    case 'bell':
      return LucideIcons.Bell;
    case 'check-circle':
      return LucideIcons.CheckCircle2;
    default:
      return LucideIcons.Activity;
  }
};

export default function SystemHealth({
  health,
  incidents,
  alerts,
  uptime,
}: SystemHealthProps) {
  const healthStatus = health > 85 ? 'success' : health > 60 ? 'warning' : 'critical';
  const healthColor =
    health > 85
      ? 'text-cs-accent-success'
      : health > 60
      ? 'text-orange-400'
      : 'text-cs-accent-danger';

  const glowColor =
    health > 85
      ? 'rgba(34, 197, 94, 0.25)'
      : health > 60
      ? 'rgba(245, 158, 11, 0.25)'
      : 'rgba(255, 77, 77, 0.25)';

  // Calculating circle properties (radius=80, circum=2 * pi * 80 ≈ 502.6)
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (health / 100) * circumference;

  return (
    <GlassCard className="p-6 relative">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-cs-blue-400/10">
        <div className="flex items-center gap-2">
          <LucideIcons.ShieldAlert className="w-5 h-5 text-cs-blue-400" />
          <h3 className="text-sm font-bold text-cs-dark-50 uppercase tracking-wider">System Integrity</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-cs-dark-700/50 border border-cs-blue-400/10 px-2.5 py-1 rounded-lg">
          <span className="text-[10px] text-cs-dark-200 opacity-60">Status:</span>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${healthColor}`}>
            {healthStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Main Health Dial */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Outer circular HUD graphics */}
            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Outer gauge back track */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="rgba(0, 120, 212, 0.05)"
                strokeWidth="6"
              />

              {/* Tick marks around the dial */}
              <circle
                cx="100"
                cy="100"
                r={radius - 8}
                fill="none"
                stroke="rgba(0, 120, 212, 0.1)"
                strokeWidth="2"
                strokeDasharray="4 8"
              />

              {/* Glowing active indicator progress ring */}
              <motion.circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="url(#healthGrad)"
                strokeWidth="6"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 8px ${glowColor})`,
                }}
              />

              {/* Radar needle sweep visual effect */}
              <motion.circle
                cx="100"
                cy="100"
                r={radius + 8}
                fill="none"
                stroke="rgba(0, 194, 255, 0.15)"
                strokeWidth="1"
                strokeDasharray="30 200"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                style={{ transformOrigin: '100px 100px' }}
              />

              <defs>
                <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00C2FF" />
                  <stop offset="60%" stopColor="#0078D4" />
                  <stop offset="100%" stopColor={healthStatus === 'critical' ? '#FF4D4D' : '#22C55E'} />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Dashboard Display */}
            <div className="relative text-center flex flex-col items-center justify-center z-10 bg-cs-dark-800/40 w-32 h-32 rounded-full border border-cs-blue-400/10 shadow-[inset_0_0_20px_rgba(0,120,212,0.1)]">
              <span className={`text-4xl font-extrabold tracking-tight ${healthColor}`}>
                {health}%
              </span>
              <span className="text-[10px] text-cs-dark-200/50 uppercase tracking-widest font-bold mt-1.5">
                Integrity
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-1.5">
            <StatusBadge status={healthStatus} size="md" animate={healthStatus !== 'success'} />
          </div>
        </div>

        {/* Info/Stats Rows */}
        <div className="flex flex-col gap-3">
          {[
            { label: 'Active Outages', value: incidents, icon: 'alert-circle', color: 'text-cs-accent-danger', bg: 'bg-cs-accent-danger/10', border: 'border-cs-accent-danger/25' },
            { label: 'Unresolved Alerts', value: alerts, icon: 'bell', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/25' },
            { label: 'Telemetry SLA', value: `${uptime}%`, icon: 'check-circle', color: 'text-cs-accent-success', bg: 'bg-cs-accent-success/10', border: 'border-cs-accent-success/25' },
          ].map((stat, idx) => {
            const IconComponent = getStatIcon(stat.icon);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className={`flex items-center justify-between p-3.5 rounded-xl bg-cs-dark-700/30 border border-cs-blue-400/8 hover:border-cs-blue-400/20 hover:bg-cs-dark-700/60 transition-all duration-200 group`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-lg ${stat.bg} border ${stat.border} transition-transform group-hover:scale-105 duration-200`}>
                    <IconComponent className={`w-4 h-4 ${stat.color} flex-shrink-0`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-cs-dark-100">{stat.label}</p>
                    <p className="text-[10px] text-cs-dark-200 opacity-40 mt-0.5">Real-time telemetry</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-base font-extrabold ${stat.color}`}>{stat.value}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
