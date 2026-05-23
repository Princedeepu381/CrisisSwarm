'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface Agent {
  id: string;
  agent_name: string;
  status: 'active' | 'investigating' | 'idle' | 'offline';
  current_task: string;
  created_at: string;
  response_time: number;
  success_rate: number;
  cpu_usage: number;
  memory_usage: number;
  incidents_handled: number;
}

interface SwarmStatusPanelProps {
  agents: Agent[];
}

export default function SwarmStatusPanel({ agents }: SwarmStatusPanelProps) {
  const activeCount = agents.filter(a => a.status !== 'offline').length;
  const busyCount = agents.filter(a => a.status === 'active' || a.status === 'investigating').length;
  
  // Compute average load
  const avgCpu = Math.floor(agents.reduce((acc, curr) => acc + curr.cpu_usage, 0) / (agents.length || 1));
  const avgSuccess = Math.floor(agents.reduce((acc, curr) => acc + curr.success_rate, 0) / (agents.length || 1));
  const totalHandled = agents.reduce((acc, curr) => acc + curr.incidents_handled, 0);

  const stats = [
    {
      icon: LucideIcons.Cpu,
      label: 'Active Agents',
      value: `${activeCount}/${agents.length}`,
      detail: `${busyCount} processing task${busyCount !== 1 ? 's' : ''}`,
    },
    {
      icon: LucideIcons.Zap,
      label: 'Remediations',
      value: String(totalHandled),
      detail: 'Cumulative responses',
    },
    {
      icon: LucideIcons.Shield,
      label: 'Avg Success Rate',
      value: `${avgSuccess}%`,
      detail: 'Mitigation rating',
    },
    {
      icon: LucideIcons.Activity,
      label: 'Swarm Cpu Load',
      value: `${avgCpu}%`,
      detail: 'Across fleet',
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
              className={`w-2 h-2 rounded-full ${busyCount > 0 ? 'bg-cs-blue-400 animate-pulse' : 'bg-cs-accent-success'}`}
            />
            Swarm Status Overview
          </h3>
          <p className="text-xs text-cs-dark-200 opacity-60 mt-1">Real-time operational metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
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
                  <p className="text-[10px] text-cs-dark-200 opacity-60 leading-tight">{stat.label}</p>
                </div>
                <p className="text-lg font-bold text-cs-dark-50">{stat.value}</p>
                <p className="text-[10px] text-cs-dark-200 opacity-50 mt-1">{stat.detail}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Status Bar */}
        <div className="pt-4 border-t border-cs-blue-400/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cs-dark-200 opacity-60">Fleet Efficiency</span>
            <span className="text-cs-accent-success font-bold">OPTIMAL</span>
          </div>
          <div className="w-full bg-cs-dark-800/50 rounded-full h-2 overflow-hidden border border-cs-blue-400/10">
            <motion.div
              className="h-full bg-gradient-to-r from-cs-accent-success to-cs-accent-success"
              initial={{ width: 0 }}
              animate={{ width: `${avgSuccess}%` }}
              transition={{ duration: 1 }}
            />
          </div>

          <div className="flex items-center justify-between text-xs mt-3">
            <span className="text-cs-dark-200 opacity-60">Swarm Activity Level</span>
            <span className={`font-bold ${busyCount > 0 ? 'text-cs-blue-400' : 'text-cs-accent-success'}`}>
              {busyCount > 0 ? 'ACTIVE RESPONSE' : 'STANDBY MONITORING'}
            </span>
          </div>
          <div className="w-full bg-cs-dark-800/50 rounded-full h-2 overflow-hidden border border-cs-blue-400/10">
            <div
              className={`h-full bg-gradient-to-r transition-all duration-500 ${busyCount > 0 ? 'from-cs-blue-400 to-cs-blue-500' : 'from-cs-accent-success to-cs-accent-success'}`}
              style={{ width: `${busyCount > 0 ? 30 + busyCount * 14 : 10}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
