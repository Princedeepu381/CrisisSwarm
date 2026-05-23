'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import * as LucideIcons from 'lucide-react';

type SortKey = 'id' | 'severity' | 'status' | 'created_at' | 'affected_service';
type SortDir = 'asc' | 'desc';

type Incident = Record<string, any> & {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'investigating' | 'resolved' | 'awaiting_approval';
  created_at: string;
  resolved_at: string | null;
  affected_service?: string;
  assigned_agent?: string;
  impact?: string;
  timeline?: { time: string; event: string }[];
};

interface IncidentTableProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const STATUS_ORDER:   Record<string, number> = { active: 0, investigating: 1, awaiting_approval: 2, resolved: 3 };

const severityConfig: Record<string, { dot: string; row: string; label: string; text: string }> = {
  critical: { dot: 'bg-cs-accent-danger', row: 'border-l-cs-accent-danger/60 bg-cs-accent-danger/5 hover:bg-cs-accent-danger/10',   label: 'bg-cs-accent-danger/20 text-cs-accent-danger border-cs-accent-danger/40',  text: 'text-cs-accent-danger' },
  high:     { dot: 'bg-orange-400',       row: 'border-l-orange-400/60 bg-orange-400/5 hover:bg-orange-400/10',                     label: 'bg-orange-400/20 text-orange-400 border-orange-400/40',                    text: 'text-orange-400'     },
  medium:   { dot: 'bg-yellow-400',       row: 'border-l-yellow-400/60 bg-yellow-400/5 hover:bg-yellow-400/10',                     label: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40',                    text: 'text-yellow-400'     },
  low:      { dot: 'bg-cs-blue-400',      row: 'border-l-cs-blue-400/60 bg-cs-blue-400/5 hover:bg-cs-blue-400/10',                  label: 'bg-cs-blue-400/20 text-cs-blue-400 border-cs-blue-400/40',                text: 'text-cs-blue-400'    },
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${Math.floor(m % 60)}m ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function IncidentTable({ incidents, onSelectIncident }: IncidentTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  const sorted = [...incidents].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'severity')  cmp = (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
    else if (sortKey === 'status')   cmp = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
    else if (sortKey === 'created_at') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    else if (sortKey === 'id')   cmp = a.id.localeCompare(b.id);
    else if (sortKey === 'affected_service') cmp = (a.affected_service ?? '').localeCompare(b.affected_service ?? '');
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <LucideIcons.ArrowUpDown className="w-3 h-3 opacity-30 ml-1 inline" />;
    return sortDir === 'asc'
      ? <LucideIcons.ArrowUp className="w-3 h-3 ml-1 inline text-cs-blue-400" />
      : <LucideIcons.ArrowDown className="w-3 h-3 ml-1 inline text-cs-blue-400" />;
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: 'id',               label: 'ID'       },
    { key: 'severity',         label: 'Severity' },
    { key: 'status',           label: 'Status'   },
    { key: 'affected_service', label: 'Service'  },
    { key: 'created_at',       label: 'Time'     },
  ];

  return (
    <GlassCard className="overflow-hidden" animate={false}>
      {/* Sticky header */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cs-blue-400/10 bg-cs-dark-700/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-cs-dark-200 opacity-60 uppercase tracking-widest cursor-pointer hover:opacity-100 hover:text-cs-blue-400 transition-all select-none whitespace-nowrap"
                >
                  {col.label}
                  <SortIcon k={col.key} />
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-cs-dark-200 opacity-60 uppercase tracking-widest whitespace-nowrap">
                Title
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-cs-dark-200 opacity-60 uppercase tracking-widest whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence mode="popLayout">
              {sorted.map((inc, idx) => {
                const sev = severityConfig[inc.severity] ?? severityConfig.low;
                return (
                  <motion.tr
                    key={inc.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => onSelectIncident(inc)}
                    className={`
                      border-b border-cs-blue-400/5 border-l-2 cursor-pointer transition-all duration-200 group
                      ${sev.row}
                    `}
                  >
                    {/* ID */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs text-cs-dark-200 opacity-70">{inc.id}</span>
                    </td>

                    {/* Severity */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sev.dot} ${inc.status !== 'resolved' ? 'animate-pulse' : ''}`} />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${sev.label}`}>
                          {inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1)}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={inc.status} size="sm" />
                    </td>

                    {/* Service */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <LucideIcons.Server className="w-3.5 h-3.5 text-cs-dark-200 opacity-40" />
                        <span className="text-xs text-cs-dark-100 opacity-80">{inc.affected_service || '—'}</span>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <LucideIcons.Clock className="w-3.5 h-3.5 text-cs-dark-200 opacity-40" />
                        <span className="text-xs text-cs-dark-200 opacity-70">{relativeTime(inc.created_at)}</span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3.5 max-w-[260px]">
                      <p className="text-sm font-medium text-cs-dark-50 group-hover:text-cs-blue-400 transition-colors truncate">
                        {inc.title}
                      </p>
                      <p className="text-xs text-cs-dark-200 opacity-50 truncate mt-0.5">
                        {inc.description}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cs-blue-500/10 text-cs-blue-400 border border-cs-blue-400/20 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        View
                        <LucideIcons.ChevronRight className="w-3 h-3" />
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {incidents.length === 0 && (
          <div className="text-center py-16">
            <LucideIcons.CheckCircle2 className="w-12 h-12 text-cs-accent-success opacity-40 mx-auto mb-3" />
            <p className="text-sm text-cs-dark-200 opacity-50">No incidents match your filters</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {incidents.length > 0 && (
        <div className="px-4 py-3 border-t border-cs-blue-400/10 bg-cs-dark-700/20 flex items-center justify-between">
          <span className="text-xs text-cs-dark-200 opacity-40">Click a row to open full details</span>
          <span className="text-xs text-cs-dark-200 opacity-40">{incidents.length} shown</span>
        </div>
      )}
    </GlassCard>
  );
}
