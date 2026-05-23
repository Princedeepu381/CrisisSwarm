'use client';

import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import SwarmTerminal from '@/components/swarm/SwarmTerminal';
import AgentGrid from '@/components/swarm/AgentGrid';
import NetworkTopology from '@/components/swarm/NetworkTopology';
import CommandExecutor from '@/components/swarm/CommandExecutor';
import SwarmMetrics from '@/components/swarm/SwarmMetrics';
import SwarmStatusPanel from '@/components/swarm/SwarmStatusPanel';
import { mockSwarmAgents, mockTerminalLogs } from '@/lib/mockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default function Agents() {
  const [agents, setAgents] = useState<any[]>(mockSwarmAgents);
  const [terminalLogs, setTerminalLogs] = useState<any[]>(mockTerminalLogs);
  const [commands, setCommands] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchAgentsData = useCallback(async (showSyncState = false) => {
    if (showSyncState) setIsSyncing(true);
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        if (data.agents) setAgents(data.agents);
        if (data.terminalLogs) setTerminalLogs(data.terminalLogs);
        if (data.commands) setCommands(data.commands);
      }
    } catch (e) {
      console.error('Error fetching swarm agent data:', e);
    } finally {
      if (showSyncState) {
        setTimeout(() => setIsSyncing(false), 500);
      }
    }
  }, []);

  const handleExecuteCommand = async (command: string) => {
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (res.ok) {
        fetchAgentsData();
      }
    } catch (e) {
      console.error('Failed to trigger agent command:', e);
    }
  };

  useEffect(() => {
    fetchAgentsData();
    const interval = setInterval(() => fetchAgentsData(false), 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [fetchAgentsData]);

  return (
    <MainLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-cs-blue-400/10 bg-gradient-to-b from-cs-dark-600/80 via-cs-dark-700/80 to-transparent backdrop-blur-xl">
        <div className="px-6 md:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-cs-dark-50 mb-2 flex items-center gap-3">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 rounded-full bg-cs-accent-success"
                  />
                  AI Swarm Operations
                </h1>
                <p className="text-sm text-cs-dark-200 opacity-70 flex items-center gap-2">
                  <LucideIcons.Zap className="w-4 h-4 text-cs-blue-400" />
                  {agents.length} Autonomous Agents • Live Telemetry Streams • Real-Time Commands
                </p>
              </div>

              <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
                <button
                  onClick={() => fetchAgentsData(true)}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-cs-blue-500/20 border border-cs-blue-400/30 rounded-lg text-sm font-medium text-cs-blue-400 hover:bg-cs-blue-500/30 transition-all flex items-center gap-2"
                >
                  <LucideIcons.RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Fleet'}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        className="p-6 md:p-8 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Swarm Metrics */}
        <motion.div variants={itemVariants}>
          <SwarmMetrics />
        </motion.div>

        {/* Top Section: Status Panel + Network Topology */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SwarmStatusPanel agents={agents} />
          </div>
          <div className="lg:col-span-2">
            <NetworkTopology />
          </div>
        </motion.div>

        {/* Middle Section: Terminal Feed + Command Executor */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96">
            <SwarmTerminal logs={terminalLogs} />
          </div>
          <div className="lg:col-span-1">
            <CommandExecutor commands={commands} onExecuteCommand={handleExecuteCommand} />
          </div>
        </motion.div>

        {/* Agent Grid */}
        <motion.div variants={itemVariants}>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-cs-dark-50 flex items-center gap-2 mb-2">
              <LucideIcons.Cpu className="w-6 h-6 text-cs-blue-400" />
              Agent Fleet
            </h2>
            <p className="text-sm text-cs-dark-200 opacity-60">
              Advanced autonomous agent monitoring with real-time performance metrics
            </p>
          </div>
          <AgentGrid agents={agents} />
        </motion.div>

        {/* Advanced Monitoring Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Analytics */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cs-blue-400/30 via-cs-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-glass blur-lg" />

            <div
              className={`
              relative z-10 p-6
              bg-gradient-to-br from-cs-dark-600/50 via-cs-dark-700/50 to-cs-dark-800/50
              backdrop-blur-xl
              border border-cs-blue-400/30 hover:border-cs-blue-400/60
              rounded-glass
              shadow-lg hover:shadow-glow-blue
              transition-all duration-300
            `}
            >
              <h3 className="text-lg font-bold text-cs-dark-50 flex items-center gap-2 mb-4">
                <LucideIcons.BarChart2 className="w-5 h-5 text-cs-blue-400" />
                Performance Analytics
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cs-dark-200 opacity-70">Average Response Time</span>
                    <span className="text-lg font-bold text-cs-blue-400">195ms</span>
                  </div>
                  <div className="w-full bg-cs-dark-800/50 rounded-full h-2 overflow-hidden border border-cs-blue-400/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cs-blue-400 to-cs-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: '38%' }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cs-dark-200 opacity-70">Success Rate</span>
                    <span className="text-lg font-bold text-cs-accent-success">98%</span>
                  </div>
                  <div className="w-full bg-cs-dark-800/50 rounded-full h-2 overflow-hidden border border-cs-blue-400/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cs-accent-success to-cs-accent-success"
                      initial={{ width: 0 }}
                      animate={{ width: '98%' }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cs-dark-200 opacity-70">Network Efficiency</span>
                    <span className="text-lg font-bold text-cs-accent-success">96%</span>
                  </div>
                  <div className="w-full bg-cs-dark-800/50 rounded-full h-2 overflow-hidden border border-cs-blue-400/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cs-accent-success to-cs-accent-success"
                      initial={{ width: 0 }}
                      animate={{ width: '96%' }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Threat Intelligence */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cs-blue-400/30 via-cs-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-glass blur-lg" />

            <div
              className={`
              relative z-10 p-6
              bg-gradient-to-br from-cs-dark-600/50 via-cs-dark-700/50 to-cs-dark-800/50
              backdrop-blur-xl
              border border-cs-blue-400/30 hover:border-cs-blue-400/60
              rounded-glass
              shadow-lg hover:shadow-glow-blue
              transition-all duration-300
            `}
            >
              <h3 className="text-lg font-bold text-cs-dark-50 flex items-center gap-2 mb-4">
                <LucideIcons.Shield className="w-5 h-5 text-orange-400" />
                Threat Intelligence
              </h3>

              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg bg-cs-dark-800/50 border border-cs-blue-400/10 hover:border-cs-blue-400/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-cs-dark-50">Threats Blocked (24h)</p>
                      <p className="text-xs text-cs-dark-200 opacity-60 mt-1">Active threat detection</p>
                    </div>
                    <span className="text-lg font-bold text-cs-accent-danger">12</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-3 rounded-lg bg-cs-dark-800/50 border border-cs-blue-400/10 hover:border-cs-blue-400/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-cs-dark-50">Anomalies Detected</p>
                      <p className="text-xs text-cs-dark-200 opacity-60 mt-1">ML-powered analysis</p>
                    </div>
                    <span className="text-lg font-bold text-orange-400">8</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-3 rounded-lg bg-cs-dark-800/50 border border-cs-blue-400/10 hover:border-cs-blue-400/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-cs-dark-50">Remediations Executed</p>
                      <p className="text-xs text-cs-dark-200 opacity-60 mt-1">Autonomous responses</p>
                    </div>
                    <span className="text-lg font-bold text-cs-accent-success">18</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
