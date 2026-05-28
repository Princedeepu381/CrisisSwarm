'use client';

import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';

interface TimelineEvent {
  time: string;
  event: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'investigating' | 'mitigating' | 'resolved' | 'awaiting_approval';
  created_at: string;
  resolved_at: string | null;
  affected_service?: string;
  assigned_agent?: string;
  impact?: string;
  timeline?: TimelineEvent[];
}

interface IncidentDrawerProps {
  incident: Incident | null;
  onClose: () => void;
  onResolve: (id: string) => void;
  onApprove?: (id: string) => void;
}

const severityStyles: Record<string, { badge: string; glow: string; label: string }> = {
  critical: { badge: 'bg-cs-accent-danger/20 text-cs-accent-danger border-cs-accent-danger/40',  glow: 'shadow-cs-accent-danger/20', label: 'CRITICAL' },
  high:     { badge: 'bg-orange-400/20 text-orange-400 border-orange-400/40',                    glow: 'shadow-orange-400/20',       label: 'HIGH'     },
  medium:   { badge: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40',                    glow: 'shadow-yellow-400/20',       label: 'MEDIUM'   },
  low:      { badge: 'bg-cs-blue-400/20 text-cs-blue-400 border-cs-blue-400/40',                 glow: 'shadow-cs-blue-400/20',      label: 'LOW'      },
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function IncidentDrawer({ incident, onClose, onResolve, onApprove }: IncidentDrawerProps) {
  const sev = incident ? severityStyles[incident.severity] ?? severityStyles.low : null;

  return (
    <AnimatePresence>
      {incident && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-cs-dark-900/60 backdrop-blur-sm z-40"
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="
              fixed right-0 top-0 bottom-0 z-50
              w-full max-w-[520px]
              bg-gradient-to-b from-cs-dark-600 via-cs-dark-700 to-cs-dark-800
              border-l border-cs-blue-400/15
              flex flex-col overflow-hidden
              shadow-2xl
            "
          >
            {/* Header */}
            <div className="flex items-start gap-4 p-6 border-b border-cs-blue-400/10 bg-cs-dark-600/60 backdrop-blur-xl flex-shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded border ${sev?.badge}`}>
                    {sev?.label}
                  </span>
                  <span className="text-xs text-cs-dark-200 opacity-50 font-mono">{incident.id}</span>
                  <StatusBadge status={incident.status} size="sm" />
                </div>
                <h2 className="text-lg font-bold text-cs-dark-50 leading-snug">{incident.title}</h2>
              </div>
              <button
                id="close-incident-drawer"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-cs-dark-700/60 text-cs-dark-200 opacity-60 hover:opacity-100 transition-all flex-shrink-0"
              >
                <LucideIcons.X className="w-5 h-5" />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold text-cs-dark-200 opacity-60 uppercase tracking-widest mb-2">
                  Description
                </h3>
                <p className="text-sm text-cs-dark-100 opacity-80 leading-relaxed">{incident.description}</p>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Affected Service', value: incident.affected_service, icon: 'server' },
                  { label: 'Assigned Agent',   value: incident.assigned_agent,   icon: 'cpu'    },
                  { label: 'Impact Level',     value: incident.impact,            icon: 'zap'    },
                  { label: 'Detected',         value: relativeTime(incident.created_at), icon: 'clock' },
                ].map((m) => {
                  const IconName = m.icon.charAt(0).toUpperCase() + m.icon.slice(1) as keyof typeof LucideIcons;
                  const Icon = (LucideIcons[IconName] as React.ElementType) || LucideIcons.Circle;
                  return (
                    <div key={m.label} className="p-3 rounded-lg bg-cs-dark-700/50 border border-cs-blue-400/8">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="w-3.5 h-3.5 text-cs-blue-400 opacity-70" />
                        <span className="text-xs text-cs-dark-200 opacity-50">{m.label}</span>
                      </div>
                      <p className="text-sm font-semibold text-cs-dark-50">{m.value || '—'}</p>
                    </div>
                  );
                })}
              </div>

              {/* Timeline */}
              {incident.timeline && incident.timeline.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-cs-dark-200 opacity-60 uppercase tracking-widest mb-3">
                    Activity Timeline
                  </h3>
                  <div className="relative pl-5 space-y-4">
                    {/* vertical line */}
                    <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-cs-blue-400/40 via-cs-blue-400/20 to-transparent" />

                    {incident.timeline.map((ev, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        className="relative flex gap-3"
                      >
                        {/* dot */}
                        <div className="absolute -left-5 top-1 w-[14px] h-[14px] rounded-full bg-cs-dark-700 border-2 border-cs-blue-400/60 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-cs-blue-400 opacity-70 mb-0.5">
                            {fmtTime(ev.time)}
                          </p>
                          <p className="text-sm text-cs-dark-100 opacity-80">{ev.event}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remediation checklist */}
              <div>
                <h3 className="text-xs font-semibold text-cs-dark-200 opacity-60 uppercase tracking-widest mb-3">
                  Remediation Steps
                </h3>
                <div className="space-y-2">
                  {[
                    { done: true,  step: 'Incident auto-detected by monitoring agent' },
                    { done: true,  step: 'Swarm agent assigned and briefed'           },
                    { done: incident.status === 'resolved', step: 'Root cause analysis completed' },
                    { done: incident.status === 'resolved', step: 'Mitigation applied and verified' },
                    { done: incident.status === 'resolved', step: 'Post-incident report generated'  },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-cs-dark-700/30 transition-all">
                      <div className={`w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border ${item.done ? 'bg-cs-accent-success/20 border-cs-accent-success/50' : 'border-cs-dark-200/20'}`}>
                        {item.done && <LucideIcons.Check className="w-3 h-3 text-cs-accent-success" />}
                      </div>
                      <p className={`text-sm ${item.done ? 'text-cs-dark-100 opacity-70 line-through' : 'text-cs-dark-50'}`}>
                        {item.step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 p-5 border-t border-cs-blue-400/10 bg-cs-dark-700/30 backdrop-blur-xl flex-shrink-0">
              <button
                id="btn-escalate"
                onClick={() => {
                  alert('Incident escalated to Tier 3 human response teams.');
                }}
                className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold border border-orange-400/30 text-orange-400 bg-orange-400/10 hover:bg-orange-400/20 transition-all duration-200"
              >
                <LucideIcons.ArrowUpCircle className="w-4 h-4 inline mr-2" />
                Escalate
              </button>
              {incident.status === 'awaiting_approval' ? (
                <>
                  <button
                    id="btn-reject-override"
                    onClick={() => onResolve(incident.id)}
                    className="flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold bg-cs-accent-danger/25 border border-cs-accent-danger/40 text-cs-accent-danger hover:bg-cs-accent-danger/35 transition-all duration-200"
                  >
                    <LucideIcons.AlertTriangle className="w-4 h-4 inline mr-1" />
                    Reject & Override
                  </button>
                  {onApprove && (
                    <button
                      id="btn-approve-swarm"
                      onClick={() => onApprove(incident.id)}
                      className="flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold bg-purple-500/20 border border-purple-400/40 text-purple-300 hover:bg-purple-500/30 transition-all duration-200 shadow-glow-purple"
                    >
                      <LucideIcons.ShieldAlert className="w-4 h-4 inline mr-1 animate-pulse" />
                      Approve Swarm
                    </button>
                  )}
                </>
              ) : (
                incident.status !== 'resolved' && (
                  <button
                    id="btn-resolve"
                    onClick={() => onResolve(incident.id)}
                    className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold bg-cs-accent-success/20 border border-cs-accent-success/40 text-cs-accent-success hover:bg-cs-accent-success/30 transition-all duration-200"
                  >
                    <LucideIcons.CheckCircle className="w-4 h-4 inline mr-2" />
                    Mark Resolved
                  </button>
                )
              )}
              <button
                id="btn-close-drawer"
                onClick={onClose}
                className="py-2.5 px-4 rounded-lg text-sm font-semibold border border-cs-blue-400/20 text-cs-dark-200 hover:text-cs-dark-50 hover:bg-cs-dark-700/50 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
