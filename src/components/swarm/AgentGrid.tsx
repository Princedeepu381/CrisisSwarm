'use client';

import { motion } from 'framer-motion';
import StatusBadge from '@/components/common/StatusBadge';
import * as LucideIcons from 'lucide-react';

interface AgentWithDetails {
  id: string;
  agent_name: string;
  status: 'active' | 'idle' | 'investigating' | 'resolved' | 'offline';
  current_task: string;
  created_at: string;
  response_time?: number;
  success_rate?: number;
  cpu_usage?: number;
  memory_usage?: number;
  incidents_handled?: number;
}

interface AgentGridProps {
  agents: AgentWithDetails[];
  onToggleAgent: (agentName: string) => void;
}

export default function AgentGrid({ agents, onToggleAgent }: AgentGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {agents.map((agent) => (
        <motion.div key={agent.id} variants={itemVariants}>
          <div className="group relative h-full">
            {/* Animated glow background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${agent.status === 'offline'
              ? 'from-cs-accent-danger/25 via-cs-accent-danger/5'
              : 'from-cs-blue-400/30 via-cs-blue-400/10'
            } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-glass blur-xl`} />

            {/* Card */}
            <div
              className={`
              relative z-10 p-5
              bg-gradient-to-br from-cs-dark-600/60 via-cs-dark-700/60 to-cs-dark-800/60
              backdrop-blur-xl
              border ${agent.status === 'offline'
                ? 'border-cs-accent-danger/30 hover:border-cs-accent-danger/60 shadow-glow-red/5'
                : 'border-cs-blue-400/30 hover:border-cs-blue-400/60 shadow-lg hover:shadow-glow-blue'
              }
              rounded-glass
              transition-all duration-300
              h-full flex flex-col
            `}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-cs-dark-50 mb-1">{agent.agent_name}</h4>
                  <p className="text-xs text-cs-dark-200 opacity-70 line-clamp-2">
                    {agent.current_task}
                  </p>
                </div>

                {/* Pulsing indicator */}
                <motion.div
                  animate={agent.status !== 'offline' ? {
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-3 h-3 rounded-full flex-shrink-0 ml-2 ${
                    agent.status === 'offline'
                      ? 'bg-cs-accent-danger/50 border border-cs-accent-danger/80'
                      : agent.status === 'active' || agent.status === 'investigating'
                        ? 'bg-cs-blue-400'
                        : 'bg-cs-accent-success'
                  }`}
                />
              </div>

              {/* Status Badge & Control Button */}
              <div className="flex items-center justify-between mb-4">
                <StatusBadge status={agent.status} size="sm" />
                
                <button
                  onClick={() => onToggleAgent(agent.agent_name)}
                  className={`
                    px-2.5 py-1 rounded-md text-xs font-semibold
                    flex items-center gap-1.5 border transition-all duration-300
                    ${agent.status === 'offline'
                      ? 'bg-cs-accent-success/20 text-cs-accent-success border-cs-accent-success/30 hover:bg-cs-accent-success/30 hover:border-cs-accent-success/50 hover:shadow-glow-green'
                      : 'bg-cs-accent-danger/20 text-cs-accent-danger border-cs-accent-danger/30 hover:bg-cs-accent-danger/30 hover:border-cs-accent-danger/50 hover:shadow-glow-red'
                    }
                  `}
                >
                  {agent.status === 'offline' ? (
                    <>
                      <LucideIcons.Play className="w-3.5 h-3.5 fill-current" />
                      Resume
                    </>
                  ) : (
                    <>
                      <LucideIcons.Pause className="w-3.5 h-3.5 fill-current" />
                      Suspend
                    </>
                  )}
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cs-dark-200 opacity-60">Response Time</span>
                  <span className="text-cs-blue-400 font-bold">{agent.response_time || 0}ms</span>
                </div>

                <div className="w-full bg-cs-dark-700/50 rounded-full h-1.5 overflow-hidden border border-cs-blue-400/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cs-blue-400 to-cs-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(agent.response_time || 0, 500) / 5}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs mt-3">
                  <span className="text-cs-dark-200 opacity-60">Success Rate</span>
                  <span className="text-cs-accent-success font-bold">{agent.success_rate || 0}%</span>
                </div>

                <div className="w-full bg-cs-dark-700/50 rounded-full h-1.5 overflow-hidden border border-cs-blue-400/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cs-accent-success to-cs-accent-success"
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.success_rate || 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Resource Usage */}
              <div className="grid grid-cols-2 gap-2 mb-4 pt-3 border-t border-cs-blue-400/10">
                <div className="p-2 bg-cs-dark-800/50 rounded border border-cs-blue-400/10">
                  <p className="text-xs text-cs-dark-200 opacity-60 mb-1">CPU</p>
                  <p className="text-sm font-bold text-cs-blue-400">{agent.cpu_usage || 0}%</p>
                </div>
                <div className="p-2 bg-cs-dark-800/50 rounded border border-cs-blue-400/10">
                  <p className="text-xs text-cs-dark-200 opacity-60 mb-1">Memory</p>
                  <p className="text-sm font-bold text-cs-blue-400">{agent.memory_usage || 0}%</p>
                </div>
              </div>

              {/* Incidents Handled */}
              <div className="mt-auto pt-3 border-t border-cs-blue-400/10 flex items-center justify-between">
                <span className="text-xs text-cs-dark-200 opacity-60 flex items-center gap-1">
                  <LucideIcons.CheckCircle className="w-3.5 h-3.5 text-cs-accent-success" />
                  Handled
                </span>
                <span className="text-sm font-bold text-cs-accent-success">{agent.incidents_handled || 0}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
