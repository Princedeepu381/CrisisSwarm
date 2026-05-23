'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface TerminalLog {
  id: string;
  timestamp: string;
  agent: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface SwarmTerminalProps {
  initialLogs?: TerminalLog[];
}

const generateTerminalLogs = (): TerminalLog[] => {
  const agents = ['AutoScaler-Alpha', 'MemoryOptimizer-Beta', 'HealthMonitor-Gamma', 'NetworkDefense-Delta', 'ResponseUnit-Epsilon'];
  const actions = [
    'Analyzing CPU patterns...',
    'Deploying auto-scaling policy',
    'Memory optimization initiated',
    'Incident response activated',
    'Network traffic intercepted',
    'DDoS mitigation engaged',
    'Anomaly detected and quarantined',
    'Load balancing adjustment',
    'Service health check passed',
    'Threat intelligence updated',
    'Autonomous remediation complete',
    'Performance metrics optimized',
  ];
  const statuses: Array<'success' | 'warning' | 'error' | 'info'> = ['success', 'warning', 'error', 'info'];

  return Array.from({ length: 12 }, (_, i) => ({
    id: `log-${i}`,
    timestamp: new Date(Date.now() - i * 5000).toLocaleTimeString(),
    agent: agents[Math.floor(Math.random() * agents.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    message: actions[Math.floor(Math.random() * actions.length)],
  }));
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'success':
      return 'text-cs-accent-success';
    case 'error':
      return 'text-cs-accent-danger';
    case 'warning':
      return 'text-orange-400';
    case 'info':
      return 'text-cs-blue-400';
    default:
      return 'text-cs-dark-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return LucideIcons.CheckCircle;
    case 'error':
      return LucideIcons.AlertCircle;
    case 'warning':
      return LucideIcons.AlertTriangle;
    case 'info':
      return LucideIcons.Info;
    default:
      return LucideIcons.Circle;
  }
};

export default function SwarmTerminal({ logs }: { logs: TerminalLog[] }) {
  const [autoScroll, setAutoScroll] = useState(true);

  return (
    <div className="relative group h-full">
      {/* Animated glow border */}
      <div className="absolute inset-0 bg-gradient-to-r from-cs-blue-400/0 via-cs-blue-400/20 to-cs-blue-400/0 rounded-glass opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      <div
        className={`
        relative z-10
        bg-gradient-to-br from-cs-dark-600/50 via-cs-dark-700/50 to-cs-dark-800/50
        backdrop-blur-xl
        border border-cs-blue-400/20 hover:border-cs-blue-400/40
        rounded-glass
        shadow-lg shadow-cs-dark-900/20 hover:shadow-glow-blue
        transition-all duration-300
        h-full flex flex-col
        font-mono text-xs
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cs-blue-400/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cs-accent-success animate-pulse"></div>
            <h3 className="text-sm font-bold text-cs-dark-50 uppercase tracking-widest">
              Swarm Terminal Feed
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                autoScroll
                  ? 'bg-cs-blue-500/30 text-cs-blue-400 border border-cs-blue-400/50'
                  : 'bg-cs-dark-700/50 text-cs-dark-200 border border-cs-blue-400/10'
              }`}
            >
              {autoScroll ? '🔴 LIVE' : '⏸ PAUSED'}
            </button>
            <LucideIcons.RefreshCw className="w-4 h-4 text-cs-blue-400 opacity-60" />
          </div>
        </div>

        {/* Terminal Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-track-cs-dark-700 scrollbar-thumb-cs-blue-400">
          {logs.map((log) => {
            const StatusIcon = getStatusIcon(log.status);
            const statusColor = getStatusColor(log.status);

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2 py-1 px-2 rounded hover:bg-cs-blue-400/5 transition-colors"
              >
                <span className="text-cs-dark-300 opacity-60 whitespace-nowrap">[{log.timestamp}]</span>
                <StatusIcon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${statusColor}`} />
                <span className="text-cs-dark-200 opacity-70 whitespace-nowrap">{log.agent}:</span>
                <span className={`${statusColor} font-semibold flex-1 line-clamp-1`}>
                  {log.message}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Stats */}
        <div className="border-t border-cs-blue-400/10 p-3 grid grid-cols-3 gap-2 text-xs bg-cs-dark-800/50">
          <div>
            <span className="text-cs-dark-200 opacity-60">Total Events:</span>
            <span className="ml-2 text-cs-blue-400 font-bold">{logs.length}</span>
          </div>
          <div>
            <span className="text-cs-dark-200 opacity-60">Feed Rate:</span>
            <span className="ml-2 text-cs-accent-success font-bold">3s</span>
          </div>
          <div>
            <span className="text-cs-dark-200 opacity-60">Status:</span>
            <span className="ml-2 text-cs-accent-success font-bold animate-pulse">ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
