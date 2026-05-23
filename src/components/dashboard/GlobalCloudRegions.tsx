'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface Region {
  name: string;
  code: string;
  status: 'healthy' | 'warning' | 'critical';
  latency: number;
}

interface GlobalCloudRegionsProps {
  activeIncidents: Array<{ affected_service: string; severity: string; status: string }>;
}

const BASE_REGIONS: Region[] = [
  { name: 'East Asia',    code: 'AP-EAST',   status: 'healthy', latency: 42 },
  { name: 'India',        code: 'IN-SOUTH',  status: 'healthy', latency: 18 },
  { name: 'Europe',       code: 'EU-WEST',   status: 'healthy', latency: 125 },
  { name: 'United States', code: 'US-EAST',  status: 'healthy', latency: 195 },
];

const statusConfig = {
  healthy:  { color: 'text-cs-accent-success', bg: 'bg-cs-accent-success', ping: 'bg-cs-accent-success', border: 'border-cs-accent-success/20' },
  warning:  { color: 'text-orange-400',        bg: 'bg-orange-400',        ping: 'bg-orange-400',        border: 'border-orange-400/20' },
  critical: { color: 'text-cs-accent-danger',  bg: 'bg-cs-accent-danger',  ping: 'bg-cs-accent-danger',  border: 'border-cs-accent-danger/30' },
};

export default function GlobalCloudRegions({ activeIncidents }: GlobalCloudRegionsProps) {
  // Compute region statuses based on active incidents
  const regions: Region[] = BASE_REGIONS.map(r => {
    const copy = { ...r };

    // If there's a critical incident affecting CDN/global services, degrade some regions
    const hasCritical = activeIncidents.some(
      i => i.status !== 'resolved' && i.severity === 'critical'
    );
    const hasHigh = activeIncidents.some(
      i => i.status !== 'resolved' && i.severity === 'high'
    );

    if (hasCritical) {
      // CDN outage affects edge regions
      if (r.code === 'AP-EAST' || r.code === 'EU-WEST') {
        copy.status = 'critical';
        copy.latency = r.latency + 280 + Math.floor(Math.random() * 100);
      } else if (r.code === 'US-EAST') {
        copy.status = 'warning';
        copy.latency = r.latency + 80 + Math.floor(Math.random() * 40);
      }
    } else if (hasHigh) {
      if (r.code === 'AP-EAST') {
        copy.status = 'warning';
        copy.latency = r.latency + 60 + Math.floor(Math.random() * 30);
      }
    }

    return copy;
  });

  const healthyCount = regions.filter(r => r.status === 'healthy').length;

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-cs-blue-400/20 via-cs-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-glass blur-lg" />
      <div className="relative z-10 p-6 bg-gradient-to-br from-cs-dark-600/50 via-cs-dark-700/50 to-cs-dark-800/50 backdrop-blur-xl border border-cs-blue-400/20 hover:border-cs-blue-400/40 rounded-glass shadow-lg hover:shadow-glow-blue transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cs-blue-400/10">
              <LucideIcons.Globe className="w-5 h-5 text-cs-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-cs-dark-50">Global Cloud Regions</h3>
              <p className="text-[11px] text-cs-dark-200 opacity-50">{healthyCount}/{regions.length} regions healthy</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cs-dark-200 opacity-50">
            <LucideIcons.Radio className="w-3.5 h-3.5" />
            Live
          </div>
        </div>

        {/* Regions Grid */}
        <div className="grid grid-cols-2 gap-3">
          {regions.map((region, idx) => {
            const cfg = statusConfig[region.status];
            return (
              <motion.div
                key={region.code}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
                className={`p-3.5 rounded-lg bg-cs-dark-800/60 border ${cfg.border} hover:bg-cs-dark-700/50 transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-cs-dark-50">{region.name}</span>
                  <span className="relative flex h-2.5 w-2.5">
                    {region.status !== 'healthy' && (
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.ping} opacity-75`} />
                    )}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.bg}`} />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-cs-dark-200 opacity-60">{region.code}</span>
                  <span className={`text-xs font-bold ${cfg.color}`}>{region.latency}ms</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
