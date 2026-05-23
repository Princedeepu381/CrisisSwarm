'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface SwarmMetric {
  label: string;
  value: string;
  unit: string;
  trend: number;
  status: 'good' | 'warning' | 'critical';
  icon: any;
}

export default function SwarmMetrics() {
  const metrics: SwarmMetric[] = [
    {
      label: 'Agent Uptime',
      value: '99.8',
      unit: '%',
      trend: 2,
      status: 'good',
      icon: LucideIcons.TrendingUp,
    },
    {
      label: 'Avg Latency',
      value: '145',
      unit: 'ms',
      trend: -8,
      status: 'good',
      icon: LucideIcons.Zap,
    },
    {
      label: 'Incidents Resolved',
      value: '847',
      unit: 'today',
      trend: 15,
      status: 'good',
      icon: LucideIcons.CheckCircle,
    },
    {
      label: 'Threat Detection',
      value: '94',
      unit: '%',
      trend: 3,
      status: 'good',
      icon: LucideIcons.Shield,
    },
  ];

  const getStatusColor = (status: string): string => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="group relative"
          >
            {/* Animated glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cs-blue-400/30 via-cs-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-glass blur-lg" />

            <div
              className={`
              relative z-10 p-5
              bg-gradient-to-br from-cs-dark-600/60 via-cs-dark-700/60 to-cs-dark-800/60
              backdrop-blur-xl
              border border-cs-blue-400/30 hover:border-cs-blue-400/60
              rounded-glass
              shadow-lg hover:shadow-glow-blue
              transition-all duration-300
            `}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-cs-dark-200 opacity-70 uppercase tracking-wider mb-1">
                    {metric.label}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value}
                    </span>
                    <span className="text-xs text-cs-dark-200 opacity-60">{metric.unit}</span>
                  </div>
                </div>
                <Icon className={`w-6 h-6 ${getStatusColor(metric.status)} opacity-70`} />
              </div>

              {/* Trend */}
              <div className="flex items-center gap-1 pt-3 border-t border-cs-blue-400/10">
                {metric.trend > 0 ? (
                  <LucideIcons.TrendingUp className="w-3.5 h-3.5 text-cs-accent-success" />
                ) : (
                  <LucideIcons.TrendingDown className="w-3.5 h-3.5 text-cs-accent-danger" />
                )}
                <span
                  className={`text-xs font-semibold ${
                    metric.trend > 0 ? 'text-cs-accent-success' : 'text-cs-accent-danger'
                  }`}
                >
                  {metric.trend > 0 ? '+' : ''}{metric.trend}% from last hour
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
