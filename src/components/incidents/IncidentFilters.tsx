'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Status = 'all' | 'active' | 'investigating' | 'resolved';

interface IncidentFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  selectedSeverities: Severity[];
  onSeverityToggle: (s: Severity) => void;
  selectedStatus: Status;
  onStatusChange: (s: Status) => void;
  totalVisible: number;
  totalAll: number;
}

const SEVERITIES: { value: Severity; label: string; color: string; ring: string }[] = [
  { value: 'critical', label: 'Critical', color: 'text-cs-accent-danger bg-cs-accent-danger/15 border-cs-accent-danger/30', ring: 'ring-cs-accent-danger/40' },
  { value: 'high',     label: 'High',     color: 'text-orange-400 bg-orange-400/15 border-orange-400/30',                    ring: 'ring-orange-400/40'  },
  { value: 'medium',   label: 'Medium',   color: 'text-yellow-400 bg-yellow-400/15 border-yellow-400/30',                    ring: 'ring-yellow-400/40'  },
  { value: 'low',      label: 'Low',      color: 'text-cs-blue-400 bg-cs-blue-400/15 border-cs-blue-400/30',                 ring: 'ring-cs-blue-400/40' },
];

const STATUSES: { value: Status; label: string }[] = [
  { value: 'all',           label: 'All Statuses'   },
  { value: 'active',        label: 'Active'         },
  { value: 'investigating', label: 'Investigating'  },
  { value: 'resolved',      label: 'Resolved'       },
];

export default function IncidentFilters({
  search, onSearchChange,
  selectedSeverities, onSeverityToggle,
  selectedStatus, onStatusChange,
  totalVisible, totalAll,
}: IncidentFiltersProps) {
  const activeFilters =
    selectedSeverities.length + (selectedStatus !== 'all' ? 1 : 0) + (search ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col lg:flex-row gap-3 items-start lg:items-center"
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-dark-200 opacity-50" />
        <input
          type="text"
          placeholder="Search incidents…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full pl-9 pr-4 py-2 rounded-lg text-sm
            bg-cs-dark-700/60 border border-cs-blue-400/10
            text-cs-dark-50 placeholder-cs-dark-200/50
            focus:outline-none focus:ring-2 focus:ring-cs-blue-400/30 focus:border-cs-blue-400/30
            transition-all duration-200
          "
        />
      </div>

      {/* Severity toggles */}
      <div className="flex gap-2 flex-wrap">
        {SEVERITIES.map((s) => {
          const active = selectedSeverities.includes(s.value);
          return (
            <button
              key={s.value}
              id={`sev-filter-${s.value}`}
              onClick={() => onSeverityToggle(s.value)}
              className={`
                px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200
                ${s.color}
                ${active ? `ring-2 ${s.ring} opacity-100` : 'opacity-50 hover:opacity-80'}
              `}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Status dropdown */}
      <div className="relative">
        <select
          id="status-filter"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as Status)}
          className="
            appearance-none pl-3 pr-8 py-2 rounded-lg text-sm
            bg-cs-dark-700/60 border border-cs-blue-400/10
            text-cs-dark-50 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-cs-blue-400/30
            transition-all duration-200
          "
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value} className="bg-cs-dark-700">
              {s.label}
            </option>
          ))}
        </select>
        <LucideIcons.ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-dark-200 opacity-50 pointer-events-none" />
      </div>

      {/* Results + clear */}
      <div className="flex items-center gap-3 ml-auto">
        <span className="text-xs text-cs-dark-200 opacity-60 whitespace-nowrap">
          {totalVisible} / {totalAll} incidents
        </span>
        {activeFilters > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cs-blue-500/20 text-cs-blue-400 border border-cs-blue-400/30">
            {activeFilters} filter{activeFilters > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </motion.div>
  );
}
