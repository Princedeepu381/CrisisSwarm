'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import IncidentStats from '@/components/incidents/IncidentStats';
import IncidentFilters from '@/components/incidents/IncidentFilters';
import IncidentTable from '@/components/incidents/IncidentTable';
import IncidentDrawer from '@/components/incidents/IncidentDrawer';
import * as LucideIcons from 'lucide-react';
import { mockIncidents } from '@/lib/mockData';

type MockIncident = typeof mockIncidents[number];
type Severity = 'critical' | 'high' | 'medium' | 'low';
type Status   = 'all' | 'active' | 'investigating' | 'mitigating' | 'resolved' | 'awaiting_approval';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>(mockIncidents);
  const [search, setSearch] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<Severity[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Status>('all');
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);

  // New Incident Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [affectedService, setAffectedService] = useState('API Gateway');
  const [impact, setImpact] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
        
        // If an incident is currently open, refresh its data too
        setSelectedIncident((curr: any) => {
          if (!curr) return null;
          const updated = data.find((i: any) => i.id === curr.id);
          return updated || null;
        });
      }
    } catch (e) {
      console.error('Error fetching incidents:', e);
    } finally {
      // Loading finished
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 8000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  function toggleSeverity(s: Severity) {
    setSelectedSeverities((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchSearch = !search || [inc.title, inc.description, inc.id, inc.affected_service ?? '']
        .some((f) => f.toLowerCase().includes(search.toLowerCase()));
      const matchSev    = selectedSeverities.length === 0 || selectedSeverities.includes(inc.severity as Severity);
      const matchStatus = selectedStatus === 'all' || inc.status === selectedStatus;
      return matchSearch && matchSev && matchStatus;
    });
  }, [incidents, search, selectedSeverities, selectedStatus]);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch('/api/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'resolved' }),
      });
      if (res.ok) {
        fetchIncidents();
      }
    } catch (e) {
      console.error('Failed to resolve incident:', e);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'mitigating' }),
      });
      if (res.ok) {
        fetchIncidents();
      }
    } catch (e) {
      console.error('Failed to approve remediation:', e);
    }
  };

  const handleNewIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          severity,
          affected_service: affectedService,
          impact,
        }),
      });

      if (res.ok) {
        // Reset form
        setTitle('');
        setDescription('');
        setSeverity('medium');
        setAffectedService('API Gateway');
        setImpact('Medium');
        setIsModalOpen(false);
        fetchIncidents();
      }
    } catch (e) {
      console.error('Failed to create incident:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                {incidents.filter((i) => i.status !== 'resolved').length} open incidents
                &nbsp;·&nbsp;
                {incidents.filter((i) => i.status === 'resolved').length} resolved
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-export-incidents"
                onClick={() => alert('Incident report exported as PDF.')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-cs-dark-200 border border-cs-blue-400/15 hover:border-cs-blue-400/30 hover:text-cs-dark-50 bg-cs-dark-700/40 transition-all duration-200 flex items-center gap-2"
              >
                <LucideIcons.Download className="w-4 h-4" />
                Export
              </button>
              <button
                id="btn-new-incident"
                onClick={() => setIsModalOpen(true)}
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
        <IncidentStats incidents={incidents} />

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
            totalAll={incidents.length}
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
        onResolve={handleResolve}
        onApprove={handleApprove}
      />

      {/* New Incident Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-cs-dark-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-gradient-to-br from-cs-dark-600 to-cs-dark-800 border border-cs-blue-400/25 rounded-glass shadow-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-cs-blue-500/5 to-transparent pointer-events-none" />

                <div className="flex items-center justify-between mb-6 pb-4 border-b border-cs-blue-400/10">
                  <h3 className="text-xl font-bold text-cs-dark-50 flex items-center gap-2">
                    <LucideIcons.AlertTriangle className="w-5 h-5 text-orange-400" />
                    Simulate System Outage
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded hover:bg-cs-dark-700 text-cs-dark-200 opacity-60 hover:opacity-100 transition-all"
                  >
                    <LucideIcons.X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleNewIncidentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-cs-dark-200 opacity-60 uppercase mb-1.5">
                      Incident Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Auth service token decryption failure"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-cs-dark-700/80 border border-cs-blue-400/20 rounded-lg px-4 py-2.5 text-sm text-cs-dark-50 placeholder-cs-dark-200 placeholder-opacity-40 focus:border-cs-blue-400/60 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cs-dark-200 opacity-60 uppercase mb-1.5">
                      Outage Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Detail the failure signature, affected components, and symptoms..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-cs-dark-700/80 border border-cs-blue-400/20 rounded-lg px-4 py-2.5 text-sm text-cs-dark-50 placeholder-cs-dark-200 placeholder-opacity-40 focus:border-cs-blue-400/60 focus:outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-cs-dark-200 opacity-60 uppercase mb-1.5">
                        Severity
                      </label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value as Severity)}
                        className="w-full bg-cs-dark-700 border border-cs-blue-400/20 rounded-lg px-3 py-2 text-sm text-cs-dark-50 focus:border-cs-blue-400/60 focus:outline-none transition-all"
                      >
                        <option value="critical">Critical (Red)</option>
                        <option value="high">High (Orange)</option>
                        <option value="medium">Medium (Yellow)</option>
                        <option value="low">Low (Blue)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-cs-dark-200 opacity-60 uppercase mb-1.5">
                        Affected Service
                      </label>
                      <select
                        value={affectedService}
                        onChange={(e) => setAffectedService(e.target.value)}
                        className="w-full bg-cs-dark-700 border border-cs-blue-400/20 rounded-lg px-3 py-2 text-sm text-cs-dark-50 focus:border-cs-blue-400/60 focus:outline-none transition-all"
                      >
                        <option value="API Gateway">API Gateway</option>
                        <option value="Auth Service">Auth Service</option>
                        <option value="Database">Database Primary</option>
                        <option value="Storage Cluster">Storage Cluster</option>
                        <option value="CDN Edge">CDN Edge</option>
                        <option value="Service Mesh">Service Mesh</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cs-dark-200 opacity-60 uppercase mb-1.5">
                      Business Impact
                    </label>
                    <select
                      value={impact}
                      onChange={(e) => setImpact(e.target.value)}
                      className="w-full bg-cs-dark-700 border border-cs-blue-400/20 rounded-lg px-3 py-2 text-sm text-cs-dark-50 focus:border-cs-blue-400/60 focus:outline-none transition-all"
                    >
                      <option value="Critical">Critical (Total Block)</option>
                      <option value="High">High Impact</option>
                      <option value="Medium">Medium degradation</option>
                      <option value="Low">Low / Negligible</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-cs-blue-400/10">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-cs-blue-400/20 text-cs-dark-200 hover:bg-cs-dark-700/50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-cs-blue-500/80 hover:bg-cs-blue-500 border border-cs-blue-400/30 transition-all flex items-center justify-center gap-2 shadow-glow-blue"
                    >
                      {isSubmitting ? (
                        <>
                          <LucideIcons.RefreshCw className="w-4 h-4 animate-spin" />
                          Simulating...
                        </>
                      ) : (
                        'Trigger Outage'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
