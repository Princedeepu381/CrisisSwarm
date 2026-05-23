'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface CommandLog {
  id: string;
  command: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  progress: number;
  timestamp: string;
  affectedAgents: number;
}

const mockCommands: CommandLog[] = [
  {
    id: '1',
    command: 'Execute Incident Response Protocol',
    status: 'completed',
    progress: 100,
    timestamp: '14:32:10',
    affectedAgents: 5,
  },
  {
    id: '2',
    command: 'Deploy Security Patches',
    status: 'executing',
    progress: 68,
    timestamp: '14:31:45',
    affectedAgents: 5,
  },
  {
    id: '3',
    command: 'Analyze Threat Intelligence',
    status: 'executing',
    progress: 42,
    timestamp: '14:31:20',
    affectedAgents: 3,
  },
  {
    id: '4',
    command: 'Load Balance Network Resources',
    status: 'pending',
    progress: 0,
    timestamp: '14:30:55',
    affectedAgents: 4,
  },
];

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'text-cs-accent-success';
    case 'executing':
      return 'text-cs-blue-400';
    case 'pending':
      return 'text-orange-400';
    case 'failed':
      return 'text-cs-accent-danger';
    default:
      return 'text-cs-dark-200';
  }
};

const getStatusBg = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-cs-accent-success/20';
    case 'executing':
      return 'bg-cs-blue-400/20';
    case 'pending':
      return 'bg-orange-400/20';
    case 'failed':
      return 'bg-cs-accent-danger/20';
    default:
      return 'bg-cs-dark-700/50';
  }
};

export default function CommandExecutor() {
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
            <LucideIcons.Zap className="w-5 h-5 text-orange-400 animate-pulse" />
            Command Execution Queue
          </h3>
          <p className="text-xs text-cs-dark-200 opacity-60 mt-1">4 Operations • 2 Active • 1 Queued</p>
        </div>

        {/* Commands List */}
        <div className="space-y-3">
          {mockCommands.map((cmd, idx) => (
            <motion.div
              key={cmd.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`
                p-4 rounded-lg border
                ${getStatusBg(cmd.status)} border-opacity-30
                hover:border-opacity-60 transition-all
              `}
            >
              {/* Command Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {cmd.status === 'executing' && (
                      <motion.div
                        className="w-2 h-2 rounded-full bg-cs-blue-400"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    {cmd.status === 'completed' && (
                      <LucideIcons.CheckCircle className="w-4 h-4 text-cs-accent-success" />
                    )}
                    {cmd.status === 'pending' && (
                      <LucideIcons.Clock className="w-4 h-4 text-orange-400" />
                    )}
                    {cmd.status === 'failed' && (
                      <LucideIcons.AlertCircle className="w-4 h-4 text-cs-accent-danger" />
                    )}

                    <span className="text-sm font-semibold text-cs-dark-50">{cmd.command}</span>
                  </div>
                  <p className="text-xs text-cs-dark-200 opacity-60 mt-1">
                    [{cmd.timestamp}] • {cmd.affectedAgents} agents
                  </p>
                </div>

                <span className={`text-xs font-bold ${getStatusColor(cmd.status)} whitespace-nowrap`}>
                  {cmd.status.toUpperCase()}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-cs-dark-200 opacity-60">Progress</span>
                  <span className="text-xs font-bold text-cs-blue-400">{cmd.progress}%</span>
                </div>
                <div className="w-full bg-cs-dark-800/50 rounded-full h-2 overflow-hidden border border-cs-blue-400/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cs-blue-400 to-cs-blue-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${cmd.progress}%`,
                      boxShadow: cmd.status === 'executing' ? '0 0 10px rgba(0, 194, 255, 0.8)' : 'none',
                    }}
                    transition={{ duration: cmd.status === 'executing' ? 2 : 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-cs-blue-400/10 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-3 py-2 bg-cs-blue-500/20 border border-cs-blue-400/50 rounded-lg text-xs font-semibold text-cs-blue-400 hover:bg-cs-blue-500/30 transition-colors"
          >
            <LucideIcons.Play className="w-3 h-3 inline mr-1" />
            New Command
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-3 py-2 bg-cs-dark-700/50 border border-cs-blue-400/10 rounded-lg text-xs font-semibold text-cs-dark-200 hover:border-cs-blue-400/30 transition-all"
          >
            <LucideIcons.History className="w-3 h-3 inline mr-1" />
            History
          </motion.button>
        </div>
      </div>
    </div>
  );
}
