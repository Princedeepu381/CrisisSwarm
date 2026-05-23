'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface SwarmStatItem {
  icon: any;
  label: string;
  value: string;
  detail: string;
}

export default function SwarmStatusPanel() {
  const stats: SwarmStatItem[] = [
    {
      icon: LucideIcons.Cpu,
      label: 'Active Agents',
      value: '5',
      detail: 'All operational',
    },
    {
      icon: LucideIcons.Zap,
      label: 'Operations/Min',
      value: '247',
      detail: 'Peak efficiency',
    },
    {
      icon: LucideIcons.Shield,
      label: 'Threats Blocked',
      value: '12',
      detail: 'Last 24 hours',
    },
    {
      icon: LucideIcons.Activity,
      label: 'System Load',
      value: '38%',
      detail: 'Optimal range',
    },
  ];

  return (
    <div className="group relative">
      {/* Animated glow border */}
      <div className="absolute inset-0 bg-gradient-to-r from-cs-blue-400/0 via-cs-blue-400/20 to-cs-blue-400/0 rounded-glass opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      <div
        className={`
        relative z-10
        bg-gradient-to-br from-cs-dark-600/50 via-cs-dark-700/50 to-cs-dark-800/50
        backdrop-blur-xl
        border border-cs-blue-400/20 hover:border-cs-blue-400/40
        rounded-glass
        shadow-lg hover:shadow-glow-blue
        transition-all duration-300
        p-6
      `}
      >
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-cs-dark-50 flex items-center gap-2">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-cs-accent-success"
            />
            Swarm Status Overview
          </h3>
          <p className="text-xs text-cs-dark-200 opacity-60 mt-1">Real-time operational metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3 rounded-lg bg-cs-dark-800/50 border border-cs-blue-400/10 hover:border-cs-blue-400/30 transition-all"
              >
                <div className="flex items-start gap-2 mb-2">
                  <Icon className="w-4 h-4 text-cs-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-cs-dark-200 opacity-60">{stat.label}</p>
                </div>
                <p className="text-lg font-bold text-cs-dark-50">{stat.value}</p>
                <p className="text-xs text-cs-dark-200 opacity-50 mt-1">{stat.detail}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Status Bar */}
        <div className="pt-4 border-t border-cs-blue-400/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cs-dark-200 opacity-60">Network Health</span>
            <span className="text-cs-accent-success font-bold">EXCELLENT</span>
          </div>
          <div className="w-full bg-cs-dark-800/50 rounded-full h-2 overflow-hidden border border-cs-blue-400/10">
            <motion.div
              className="h-full bg-gradient-to-r from-cs-accent-success to-cs-accent-success"
              initial={{ width: 0 }}
              animate={{ width: '94%' }}
              transition={{ duration: 1 }}
            />
          </div>

          <div className="flex items-center justify-between text-xs mt-3">
            <span className="text-cs-dark-200 opacity-60">Threat Level</span>
            <span className="text-cs-accent-success font-bold">LOW</span>
          </div>
          <div className="w-full bg-cs-dark-800/50 rounded-full h-2 overflow-hidden border border-cs-blue-400/10">
            <motion.div
              className="h-full bg-gradient-to-r from-cs-accent-success to-cs-accent-success"
              initial={{ width: 0 }}
              animate={{ width: '8%' }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
