'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import IncidentStats from '@/components/incidents/IncidentStats';
import IncidentFilters from '@/components/incidents/IncidentFilters';
import IncidentTable from '@/components/incidents/IncidentTable';
import IncidentDrawer from '@/components/incidents/IncidentDrawer';
import * as LucideIcons from 'lucide-react';
import { mockIncidents } from '@/lib/mockData';

type MockIncident = typeof mockIncidents[number];
type Severity = 'critical' | 'high' | 'medium' | 'low';
type Status   = 'all' | 'active' | 'investigating' | 'resolved';

export default function IncidentsPage() {
  const [search,             setSearch]             = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<Severity[]>([]);
  const [selectedStatus,     setSelectedStatus]     = useState<Status>('all');
  const [selectedIncident,   setSelectedIncident]   = useState<MockIncident | null>(null);

  function toggleSeverity(s: Severity) {
    setSelectedSeverities((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  const filteredIncidents = useMemo(() => {
    return mockIncidents.filter((inc) => {
      const matchSearch = !search || [inc.title, inc.description, inc.id, inc.affected_service ?? '']
        .some((f) => f.toLowerCase().includes(search.toLowerCase()));
      const matchSev    = selectedSeverities.length === 0 || selectedSeverities.includes(inc.severity as Severity);
      const matchStatus = selectedStatus === 'all' || inc.status === selectedStatus;
      return matchSearch && matchSev && matchStatus;
    });
  }, [search, selectedSeverities, selectedStatus]);

  return (
    <MainLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-cs-blue-400/10 bg-gradient-to-b from-cs-dark-600/90 via-cs-dark-700/80 to-transparent backdrop-blur-xl">
        <div className="px-6 md:px-8 py-5">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 flex-wrap"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-cs-dark-50 mb-1">
                Incident Center
              </h1>
              <p className="text-sm text-cs-dark-200 opacity-60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cs-accent-danger animate-pulse" />
                {mockIncidents.filter((i) => i.status !== 'resolved').length} open incidents
                &nbsp;·&nbsp;
                {mockIncidents.filter((i) => i.status === 'resolved').length} resolved
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-export-incidents"
                className="px-4 py-2 rounded-lg text-sm font-medium text-cs-dark-200 border border-cs-blue-400/15 hover:border-cs-blue-400/30 hover:text-cs-dark-50 bg-cs-dark-700/40 transition-all duration-200 flex items-center gap-2"
              >
                <LucideIcons.Download className="w-4 h-4" />
                Export
              </button>
              <button
                id="btn-new-incident"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-cs-blue-500/80 hover:bg-cs-blue-500 border border-cs-blue-400/30 transition-all duration-200 flex items-center gap-2 shadow-glow-blue"
              >
                <LucideIcons.Plus className="w-4 h-4" />
                New Incident
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 space-y-6">
        {/* KPI Stats */}
        <IncidentStats incidents={mockIncidents} />

        {/* Filter Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <IncidentFilters
            search={search}
            onSearchChange={setSearch}
            selectedSeverities={selectedSeverities}
            onSeverityToggle={toggleSeverity}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            totalVisible={filteredIncidents.length}
            totalAll={mockIncidents.length}
          />
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <IncidentTable
            incidents={filteredIncidents as MockIncident[]}
            onSelectIncident={(inc) => setSelectedIncident(inc as MockIncident)}
          />
        </motion.div>
      </div>

      {/* Detail Drawer */}
      <IncidentDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />
    </MainLayout>
  );
}
