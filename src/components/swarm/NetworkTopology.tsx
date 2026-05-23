'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';

interface NetworkNode {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'warning' | 'error';
  connections: string[];
  cpu: number;
  memory: number;
  latency: number;
  x: number;
  y: number;
}

const nodes: NetworkNode[] = [
  { id: 'hub', name: 'Central Command Hub', role: 'Security Gateway', status: 'active', connections: ['alpha', 'beta', 'gamma', 'delta'], cpu: 42, memory: 58, latency: 12, x: 200, y: 150 },
  { id: 'alpha', name: 'Alpha Node', role: 'AutoScaler Unit', status: 'active', connections: ['hub', 'beta'], cpu: 28, memory: 35, latency: 45, x: 90, y: 70 },
  { id: 'beta', name: 'Beta Node', role: 'Memory Optimizer', status: 'active', connections: ['hub', 'alpha'], cpu: 52, memory: 74, latency: 85, x: 310, y: 70 },
  { id: 'gamma', name: 'Gamma Node', role: 'Health Monitor', status: 'warning', connections: ['hub', 'delta'], cpu: 78, memory: 65, latency: 120, x: 80, y: 230 },
  { id: 'delta', name: 'Delta Node', role: 'Network Shield', status: 'active', connections: ['hub', 'gamma'], cpu: 32, memory: 48, latency: 25, x: 320, y: 230 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-cs-accent-success';
    case 'warning':
      return 'text-orange-400';
    case 'error':
      return 'text-cs-accent-danger';
    default:
      return 'text-cs-dark-200';
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-cs-accent-success/10 border-cs-accent-success/30';
    case 'warning':
      return 'bg-orange-400/10 border-orange-400/30';
    case 'error':
      return 'bg-cs-accent-danger/10 border-cs-accent-danger/30';
    default:
      return 'bg-cs-dark-700/50 border-cs-blue-400/10';
  }
};

export default function NetworkTopology() {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('hub');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  return (
    <GlassCard className="p-6 h-full flex flex-col justify-between" hover={false}>
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-cs-blue-400/10">
        <div>
          <h3 className="text-sm font-bold text-cs-dark-50 uppercase tracking-wider flex items-center gap-2">
            <LucideIcons.Network className="w-5 h-5 text-cs-blue-400" />
            Swarm Topology
          </h3>
          <p className="text-[10px] text-cs-dark-200 opacity-50 mt-0.5">
            Interactive live agent node map
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] bg-cs-blue-400/10 border border-cs-blue-400/20 text-cs-blue-400 px-2 py-0.5 rounded-md font-mono">
            SECURE LINK ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center flex-1">
        {/* SVG Network Map (Cols 1 and 2) */}
        <div className="lg:col-span-2 relative flex items-center justify-center bg-cs-dark-800/20 border border-cs-blue-400/5 rounded-xl p-4 min-h-[280px]">
          {/* Subtle radar grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,120,212,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          <svg viewBox="0 0 400 300" className="w-full h-full max-h-[300px] select-none">
            {/* Draw connections */}
            {nodes.flatMap((node) =>
              node.connections.map((targetId) => {
                const target = nodes.find((n) => n.id === targetId);
                if (!target || node.id > targetId) return null; // Avoid duplicate lines

                const isPathActive =
                  hoveredNodeId === node.id || hoveredNodeId === target.id || selectedNodeId === node.id || selectedNodeId === target.id;

                return (
                  <g key={`${node.id}-${targetId}`}>
                    {/* Background link track */}
                    <line
                      x1={node.x}
                      y1={node.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isPathActive ? 'rgba(0, 194, 255, 0.25)' : 'rgba(0, 120, 212, 0.08)'}
                      strokeWidth={isPathActive ? 2 : 1.5}
                      className="transition-all duration-300"
                    />

                    {/* Data packets (Pulsing flow dots along paths) */}
                    {isPathActive && (
                      <motion.circle
                        r="3.5"
                        fill="#00C2FF"
                        style={{ filter: 'drop-shadow(0 0 4px #00C2FF)' }}
                        animate={{
                          cx: [node.x, target.x],
                          cy: [node.y, target.y],
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: node.id === 'hub' ? 0.3 : 0,
                        }}
                      />
                    )}
                  </g>
                );
              })
            )}

            {/* Draw nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const statusColor =
                node.status === 'active'
                  ? '#22C55E'
                  : node.status === 'warning'
                  ? '#F59E0B'
                  : '#FF4D4D';

              return (
                <g
                  key={node.id}
                  className="cursor-pointer group/node"
                  onClick={() => setSelectedNodeId(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Outer pulsing glow rings */}
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 26 : isHovered ? 22 : 18}
                    fill="none"
                    stroke={statusColor}
                    strokeWidth="1"
                    strokeOpacity="0.4"
                    animate={{
                      scale: isSelected ? [1, 1.15, 1] : [1, 1.08, 1],
                      opacity: [0.6, 0.2, 0.6],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: node.id === 'hub' ? 3 : 2.2,
                    }}
                  />

                  {/* Inner node shape */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.id === 'hub' ? 14 : 11}
                    fill="#080D17"
                    stroke={isSelected ? '#00C2FF' : 'rgba(0,120,212,0.3)'}
                    strokeWidth="2"
                    style={{
                      filter: isSelected ? 'drop-shadow(0 0 6px rgba(0,194,255,0.4))' : 'none',
                    }}
                    className="transition-all duration-300"
                  />

                  {/* Tiny core status dot */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.id === 'hub' ? 6 : 4.5}
                    fill={statusColor}
                  />

                  {/* Node Name Label */}
                  <text
                    x={node.x}
                    y={node.y - (node.id === 'hub' ? 30 : 22)}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-cs-dark-50 tracking-wider uppercase select-none opacity-80 pointer-events-none"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                  >
                    {node.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Details Sidepanel (Col 3) */}
        <div className="flex flex-col h-full justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className={`p-4 rounded-xl border ${getStatusBg(selectedNode.status)} flex-1 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <div>
                    <h4 className="text-xs font-extrabold text-cs-dark-50 uppercase tracking-wider">
                      {selectedNode.name}
                    </h4>
                    <p className="text-[10px] text-cs-dark-200 opacity-60 mt-0.5">
                      {selectedNode.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${getStatusColor(selectedNode.status)}`}>
                      {selectedNode.status}
                    </span>
                  </div>
                </div>

                {/* Micro Node Stats */}
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-cs-dark-200 opacity-60">CPU load</span>
                      <span className="font-bold text-cs-dark-50">{selectedNode.cpu}%</span>
                    </div>
                    <div className="h-1 bg-cs-dark-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-cs-blue-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedNode.cpu}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-cs-dark-200 opacity-60">Memory usage</span>
                      <span className="font-bold text-cs-dark-50">{selectedNode.memory}%</span>
                    </div>
                    <div className="h-1 bg-cs-dark-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-purple-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedNode.memory}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-white/5">
                    <span className="text-cs-dark-200 opacity-60">Node Latency</span>
                    <span className="font-mono font-bold text-cs-accent-cyan">{selectedNode.latency}ms</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-cs-dark-200 opacity-60">Active connections</span>
                    <span className="font-bold text-cs-dark-50">{selectedNode.connections.length} nodes</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5">
                <button
                  id={`btn-ping-node-${selectedNode.id}`}
                  className="w-full py-1.5 bg-white/5 hover:bg-white/10 active:scale-98 rounded-lg border border-white/10 text-[10px] font-bold text-cs-dark-100 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                >
                  <LucideIcons.Radio className="w-3.5 h-3.5" />
                  Transmit Node Ping
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </GlassCard>
  );
}
