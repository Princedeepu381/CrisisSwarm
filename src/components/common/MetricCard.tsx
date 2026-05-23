'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

type IconName = keyof typeof LucideIcons;

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
  status?: 'good' | 'warning' | 'critical' | 'neutral';
  children?: ReactNode;
}

const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> | null => {
  const icons: { [key: string]: IconName } = {
    'trending-up': 'TrendingUp',
    'activity': 'Activity',
    'zap': 'Zap',
    'server': 'Server',
    'alert-circle': 'AlertCircle',
    'check-circle': 'CheckCircle',
    'clock': 'Clock',
    'signal': 'Signal',
  };
  
  const iconKey = icons[iconName] as IconName | undefined;
  if (!iconKey) return null;
  
  return LucideIcons[iconKey] as React.ComponentType<{ className?: string }> || null;
};

const getStatusColor = (status: string | undefined): string => {
  switch (status) {
    case 'good':
      return 'text-cs-accent-success';
    case 'warning':
      return 'text-orange-400';
    case 'critical':
      return 'text-cs-accent-danger';
    default:
      return 'text-cs-blue-400';
  }
};

export default function MetricCard({
  label,
  value,
  unit = '',
  icon,
  trend,
  status = 'neutral',
  children,
}: MetricCardProps) {
  const Icon = icon ? getIconComponent(icon) : null;
  const statusColor = getStatusColor(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative group
        bg-gradient-to-br from-cs-dark-600/50 via-cs-dark-700/50 to-cs-dark-800/50
        backdrop-blur-xl
        border border-cs-blue-400/10 hover:border-cs-blue-400/20
        rounded-glass p-6
        shadow-lg shadow-cs-dark-900/20 hover:shadow-glow-blue
        transition-all duration-300
      `}
    >
      {/* Gradient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cs-blue-400/0 via-cs-blue-400/0 to-cs-blue-400/0 group-hover:from-cs-blue-400/5 group-hover:via-transparent group-hover:to-cs-blue-400/5 transition-all duration-500 opacity-0 group-hover:opacity-100 rounded-glass" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs md:text-sm font-medium text-cs-dark-200 opacity-70 uppercase tracking-wider">
              {label}
            </p>
          </div>
          {Icon && (
            <Icon className={`w-5 h-5 ${statusColor} opacity-70`} />
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className={`text-2xl md:text-3xl font-bold ${statusColor}`}>
            {value}
          </span>
          {unit && (
            <span className="text-sm text-cs-dark-200 opacity-60">
              {unit}
            </span>
          )}
        </div>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-1">
            <motion.div
              animate={{
                y: trend.isPositive ? [0, -2, 0] : [0, 2, 0],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {trend.isPositive ? (
                <LucideIcons.TrendingUp className="w-4 h-4 text-cs-accent-success" />
              ) : (
                <LucideIcons.TrendingDown className="w-4 h-4 text-cs-accent-danger" />
              )}
            </motion.div>
            <span
              className={`text-xs font-semibold ${
                trend.isPositive ? 'text-cs-accent-success' : 'text-cs-accent-danger'
              }`}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          </div>
        )}

        {/* Children content */}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </motion.div>
  );
}
