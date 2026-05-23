'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/common/GlassCard';
import * as LucideIcons from 'lucide-react';

interface Incident {
  id: string;
  status: 'active' | 'investigating' | 'resolved';
  severity: 'critical' | 'high' | 'medium' | 'low';
  created_at: string;
  resolved_at: string | null;
}

interface IncidentStatsProps {
  incidents: Incident[];
}

export default function IncidentStats({ incidents }: IncidentStatsProps) {
  const total = incidents.length;
  const open = incidents.filter((i) => i.status === 'active' || i.status === 'investigating').length;
  const resolved = incidents.filter((i) => i.status === 'resolved').length;
  const critical = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;

  const stats = [
    {
      label: 'Total Incidents',
      value: total,
      icon: 'list',
      color: 'text-cs-blue-400',
      bg: 'bg-cs-blue-400/10',
      border: 'border-cs-blue-400/20',
    },
    {
      label: 'Open',
      value: open,
      icon: 'alert-circle',
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
      border: 'border-orange-400/20',
      pulse: open > 0,
    },
    {
      label: 'Resolved',
      value: resolved,
      icon: 'check-circle-2',
      color: 'text-cs-accent-success',
      bg: 'bg-cs-accent-success/10',
      border: 'border-cs-accent-success/20',
    },
    {
      label: 'Critical Active',
      value: critical,
      icon: 'flame',
      color: 'text-cs-accent-danger',
      bg: 'bg-cs-accent-danger/10',
      border: 'border-cs-accent-danger/20',
      pulse: critical > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        // Dynamically pick icon from lucide
        const IconName = stat.icon
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join('') as keyof typeof LucideIcons;
        const Icon = (LucideIcons[IconName] as React.ElementType) || LucideIcons.Circle;

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bg} border ${stat.border}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.pulse && (
                  <span className="w-2 h-2 rounded-full bg-cs-accent-danger animate-pulse" />
                )}
              </div>
              <p className="text-3xl font-bold text-cs-dark-50 mb-1">{stat.value}</p>
              <p className="text-xs text-cs-dark-200 opacity-60">{stat.label}</p>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
