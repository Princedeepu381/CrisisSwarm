'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import * as LucideIcons from 'lucide-react';

interface IncidentItem {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  status: 'active' | 'investigating' | 'resolved';
  created_at: string;
  affected_service?: string;
}

interface IncidentFeedProps {
  incidents: IncidentItem[];
}

const severityConfig: {
  [key: string]: { color: string; bgColor: string; icon: string };
} = {
  critical: { color: 'text-cs-accent-danger', bgColor: 'bg-cs-accent-danger/10', icon: 'alert-circle' },
  high: { color: 'text-orange-400', bgColor: 'bg-orange-400/10', icon: 'alert-circle' },
  medium: { color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', icon: 'alert-triangle' },
  low: { color: 'text-cs-blue-400', bgColor: 'bg-cs-blue-400/10', icon: 'info' },
};

export default function IncidentFeed({ incidents }: IncidentFeedProps) {
  return (
    <GlassCard className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-cs-dark-50 flex items-center gap-2">
          <LucideIcons.AlertTriangle className="w-5 h-5 text-cs-accent-danger" />
          Live Incidents
        </h3>
        <p className="text-xs text-cs-dark-200 opacity-60 mt-1">Real-time incident monitoring</p>
      </div>

      <div className="space-y-3">
        {incidents.map((incident, idx) => {
          const severity = severityConfig[incident.severity] || severityConfig.low;

          return (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`
                p-4 rounded-lg border transition-all duration-300
                ${severity.bgColor} border-opacity-20
                hover:border-opacity-50 hover:shadow-glow-sm
                cursor-pointer group
              `}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${severity.bgColor}`}>
                  <LucideIcons.AlertTriangle className={`w-4 h-4 ${severity.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-cs-dark-50 group-hover:text-cs-blue-400 transition-colors">
                      {incident.title}
                    </h4>
                    <StatusBadge status={incident.status} size="sm" />
                  </div>

                  <p className="text-xs text-cs-dark-200 opacity-70 mb-2">
                    {incident.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs">
                    {incident.affected_service && (
                      <div className="flex items-center gap-1 text-cs-dark-200 opacity-60">
                        <LucideIcons.Server className="w-3 h-3" />
                        <span>{incident.affected_service}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-cs-dark-200 opacity-60">
                      <LucideIcons.Clock className="w-3 h-3" />
                      <span>
                        {(() => {
                          const now = new Date();
                          const date = new Date(incident.created_at);
                          const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
                          if (seconds < 60) return `${seconds}s ago`;
                          if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
                          return `${Math.floor(seconds / 3600)}h ago`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Severity Badge */}
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${severity.color} ${severity.bgColor}`}>
                  {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                </div>
              </div>
            </motion.div>
          );
        })}

        {incidents.length === 0 && (
          <div className="text-center py-12">
            <LucideIcons.CheckCircle className="w-12 h-12 text-cs-accent-success opacity-50 mx-auto mb-3" />
            <p className="text-sm text-cs-dark-200 opacity-60">No incidents detected</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
