'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/common/GlassCard';
import * as LucideIcons from 'lucide-react';

interface ServiceNode {
  id: string;
  label: string;
  health: number;
  x: number;
  y: number;
  type: 'gateway' | 'service' | 'data' | 'cdn';
}

interface Edge {
  from: string;
  to: string;
  traffic: number; // 0-1 intensity
}

const NODES: ServiceNode[] = [
  { id: 'cdn',   label: 'CDN Edge',        health: 94,  x: 50,  y: 20,  type: 'cdn'     },
  { id: 'lb',    label: 'Load Balancer',   health: 88,  x: 50,  y: 38,  type: 'gateway' },
  { id: 'api',   label: 'API Gateway',     health: 96,  x: 50,  y: 56,  type: 'gateway' },
  { id: 'auth',  label: 'Auth Service',    health: 78,  x: 20,  y: 68,  type: 'service' },
  { id: 'proc',  label: 'Processing',      health: 85,  x: 50,  y: 74,  type: 'service' },
  { id: 'mesh',  label: 'Service Mesh',    health: 72,  x: 80,  y: 68,  type: 'service' },
  { id: 'db',    label: 'PostgreSQL',      health: 99,  x: 30,  y: 88,  type: 'data'    },
  { id: 'cache', label: 'Redis Cache',     health: 97,  x: 70,  y: 88,  type: 'data'    },
];

const EDGES: Edge[] = [
  { from: 'cdn',  to: 'lb',    traffic: 0.9 },
  { from: 'lb',   to: 'api',   traffic: 0.85 },
  { from: 'api',  to: 'auth',  traffic: 0.5 },
  { from: 'api',  to: 'proc',  traffic: 0.7 },
  { from: 'api',  to: 'mesh',  traffic: 0.6 },
  { from: 'proc', to: 'db',    traffic: 0.65 },
  { from: 'proc', to: 'cache', traffic: 0.8 },
  { from: 'mesh', to: 'cache', traffic: 0.4 },
];

function nodeColor(health: number) {
  if (health >= 95) return '#22C55E';
  if (health >= 85) return '#F59E0B';
  return '#FF4D4D';
}

// SVG width/height in viewBox units
const VW = 100;
const VH = 100;

function edgePoints(from: ServiceNode, to: ServiceNode) {
  return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
}

// Animated pulse dot that travels along edge
function FlowPulse({ x1, y1, x2, y2, duration }: { x1: number; y1: number; x2: number; y2: number; duration: number }) {
  return (
    <motion.circle
      r={0.8}
      fill="#00C2FF"
      opacity={0.8}
      animate={{
        cx: [x1, x2],
        cy: [y1, y2],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

export default function TopologyHealthMap() {
  const [selected, setSelected] = useState<ServiceNode | null>(null);
  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-cs-dark-50 flex items-center gap-2">
            <LucideIcons.Network className="w-5 h-5 text-cs-blue-400" />
            Service Topology Map
          </h3>
          <p className="text-xs text-cs-dark-200 opacity-50 mt-1">Live health status · Click a node for details</p>
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap">
          {[
            { color: '#22C55E', label: 'Healthy ≥95%' },
            { color: '#F59E0B', label: 'Warning 85–94%' },
            { color: '#FF4D4D', label: 'Critical <85%' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-cs-dark-200 opacity-55">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="w-full"
          style={{ height: '340px' }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="glow-green">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-red">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {EDGES.map((edge) => {
            const from = nodeMap[edge.from];
            const to   = nodeMap[edge.to];
            if (!from || !to) return null;
            const { x1, y1, x2, y2 } = edgePoints(from, to);
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(0,194,255,0.18)"
                  strokeWidth={0.6}
                  strokeDasharray="2 2"
                />
                <FlowPulse
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  duration={2 + (1 - edge.traffic) * 2}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map((node) => {
            const color = nodeColor(node.health);
            const isSelected = selected?.id === node.id;
            const isCritical = node.health < 85;

            return (
              <g
                key={node.id}
                onClick={() => setSelected(isSelected ? null : node)}
                style={{ cursor: 'pointer' }}
              >
                {/* Selection ring */}
                {isSelected && (
                  <motion.circle
                    cx={node.x} cy={node.y} r={5.5}
                    fill="none"
                    stroke={color}
                    strokeWidth={0.8}
                    strokeOpacity={0.6}
                    animate={{ r: [5.5, 7, 5.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Pulse ring for critical */}
                {isCritical && !isSelected && (
                  <motion.circle
                    cx={node.x} cy={node.y} r={4.5}
                    fill="none"
                    stroke={color}
                    strokeWidth={0.5}
                    animate={{ r: [4.5, 6.5], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* Main circle */}
                <circle
                  cx={node.x} cy={node.y} r={4}
                  fill={`${color}22`}
                  stroke={color}
                  strokeWidth={0.8}
                  filter={isCritical ? 'url(#glow-red)' : 'url(#glow-green)'}
                />

                {/* Health text inside */}
                <text
                  x={node.x} y={node.y + 0.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="2.2"
                  fontWeight="bold"
                  fill={color}
                >
                  {node.health}%
                </text>

                {/* Label below */}
                <text
                  x={node.x}
                  y={node.y + 6.5}
                  textAnchor="middle"
                  fontSize="2.5"
                  fill="rgba(209,222,235,0.75)"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected node detail card */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 right-2 bg-cs-dark-600/95 border border-cs-blue-400/20 rounded-xl p-3 backdrop-blur-xl text-xs shadow-xl w-44"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-cs-dark-50">{selected.label}</span>
              <button onClick={() => setSelected(null)} className="text-cs-dark-200 opacity-50 hover:opacity-100">
                <LucideIcons.X className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-cs-dark-200 opacity-60">Health</span>
                <span style={{ color: nodeColor(selected.health) }} className="font-bold">{selected.health}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cs-dark-200 opacity-60">Type</span>
                <span className="text-cs-dark-100 capitalize">{selected.type}</span>
              </div>
              <div className="w-full bg-cs-dark-700 rounded-full h-1.5 mt-2">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${selected.health}%`, backgroundColor: nodeColor(selected.health) }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}
