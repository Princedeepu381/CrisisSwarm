'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import GlassCard from '@/components/common/GlassCard';
import * as LucideIcons from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ThresholdSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  color: string;
  onChange: (v: number) => void;
}

interface ToggleProps {
  id: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Toggle({ id, enabled, onChange }: ToggleProps) {
  return (
    <button
      id={id}
      onClick={() => onChange(!enabled)}
      className={`
        relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0
        ${enabled ? 'bg-cs-blue-500/80 shadow-glow-blue' : 'bg-cs-dark-700/80'}
        border ${enabled ? 'border-cs-blue-400/40' : 'border-cs-blue-400/10'}
      `}
    >
      <motion.span
        layout
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

function ThresholdSlider({ id, label, value, min, max, unit, color, onChange }: ThresholdSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm text-cs-dark-100 opacity-80">{label}</label>
        <span className="text-sm font-bold" style={{ color }}>{value}{unit}</span>
      </div>
      <div className="relative h-2 bg-cs-dark-700 rounded-full">
        <div
          className="absolute left-0 top-0 h-2 rounded-full transition-all duration-200"
          style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.7 }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 bg-cs-dark-600 transition-all duration-200"
          style={{ left: `${pct}%`, borderColor: color }}
        />
      </div>
      <div className="flex justify-between text-xs text-cs-dark-200 opacity-40">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ icon, title, description, delay, children }: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
  children: React.ReactNode;
}) {
  const Icon = icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ?? 0 }}
    >
      <GlassCard className="p-6">
        <div className="flex items-start gap-3 mb-5 pb-4 border-b border-cs-blue-400/10">
          <div className="p-2 rounded-lg bg-cs-blue-400/10 border border-cs-blue-400/20">
            <Icon className="w-5 h-5 text-cs-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-cs-dark-50">{title}</h2>
            <p className="text-xs text-cs-dark-200 opacity-55 mt-0.5">{description}</p>
          </div>
        </div>
        {children}
      </GlassCard>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Notification prefs
  const [notifs, setNotifs] = useState({
    criticalAlerts:  true,
    highAlerts:      true,
    mediumAlerts:    false,
    emailDigest:     true,
    slackWebhook:    false,
    smsAlerts:       false,
  });

  // Alert thresholds
  const [thresholds, setThresholds] = useState({
    cpu:         80,
    memory:      85,
    responseTime: 300,
    errorRate:   1.0,
    diskUsage:   90,
  });

  // Agent settings
  const [agents, setAgents] = useState({
    autoScaling:     true,
    autoRemediation: true,
    anomalyDetect:   true,
    reportGeneration: false,
    maintenanceMode: false,
  });

  // System prefs
  const [prefs, setPrefs] = useState({
    autoRefresh:   true,
    soundAlerts:   false,
    compactMode:   false,
    showTimestamps: true,
  });

  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-cs-blue-400/10 bg-gradient-to-b from-cs-dark-600/90 via-cs-dark-700/80 to-transparent backdrop-blur-xl">
        <div className="px-6 md:px-8 py-5">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-cs-dark-50 mb-1">Settings</h1>
              <p className="text-sm text-cs-dark-200 opacity-60">
                Configure alert thresholds, notifications, and agent behaviour
              </p>
            </div>
            <motion.button
              id="btn-save-settings"
              onClick={handleSave}
              whileTap={{ scale: 0.97 }}
              className={`
                px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-300
                ${saved
                  ? 'bg-cs-accent-success/20 border border-cs-accent-success/40 text-cs-accent-success'
                  : 'bg-cs-blue-500/80 hover:bg-cs-blue-500 border border-cs-blue-400/30 text-white shadow-glow-blue'
                }
              `}
            >
              {saved ? (
                <><LucideIcons.CheckCircle className="w-4 h-4" />Saved!</>
              ) : (
                <><LucideIcons.Save className="w-4 h-4" />Save Changes</>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 space-y-6 max-w-4xl">

        {/* Azure Integration Panel */}
        <Section
          icon={LucideIcons.Cloud}
          title="Azure Integration"
          description="Manage cloud connectivity, API status, and deployment health"
          delay={0.05}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-cs-dark-800/50 border border-cs-blue-400/10 hover:border-cs-blue-400/30 transition-all">
              <div>
                <p className="text-sm font-semibold text-cs-dark-50">API Connection Status</p>
                <p className="text-xs text-cs-dark-200 opacity-60 mt-0.5">Connected to Azure Serverless Functions</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cs-accent-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cs-accent-success"></span>
                </span>
                <span className="text-sm font-bold text-cs-accent-success">Healthy</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-cs-dark-800/50 border border-cs-blue-400/10 hover:border-cs-blue-400/30 transition-all">
              <div>
                <p className="text-sm font-semibold text-cs-dark-50">Deployment Environment</p>
                <p className="text-xs text-cs-dark-200 opacity-60 mt-0.5">Azure Static Web Apps (Production)</p>
              </div>
              <div className="flex items-center gap-2">
                <LucideIcons.CheckCircle className="w-4 h-4 text-cs-blue-400" />
                <span className="text-sm font-bold text-cs-blue-400">Deployed</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-cs-dark-800/50 border border-cs-blue-400/10 hover:border-cs-blue-400/30 transition-all">
              <div>
                <p className="text-sm font-semibold text-cs-dark-50">Azure Monitor Telemetry</p>
                <p className="text-xs text-cs-dark-200 opacity-60 mt-0.5">Streaming real-time metrics</p>
              </div>
              <Toggle id="toggle-azure-monitor" enabled={true} onChange={() => {}} />
            </div>
          </div>
        </Section>

        {/* Alert Thresholds */}
        <Section
          icon={LucideIcons.SlidersHorizontal}
          title="Alert Thresholds"
          description="Tune when CrisisSwarm fires incident alerts for each metric"
          delay={0.1}
        >
          <div className="space-y-6">
            <ThresholdSlider id="threshold-cpu"           label="CPU Utilisation"   value={thresholds.cpu}          min={50} max={100} unit="%" color="#00C2FF" onChange={(v) => setThresholds((p) => ({ ...p, cpu: v }))} />
            <ThresholdSlider id="threshold-memory"        label="Memory Usage"      value={thresholds.memory}       min={50} max={100} unit="%" color="#818CF8" onChange={(v) => setThresholds((p) => ({ ...p, memory: v }))} />
            <ThresholdSlider id="threshold-response-time" label="Response Time"     value={thresholds.responseTime} min={100} max={1000} unit="ms" color="#F59E0B" onChange={(v) => setThresholds((p) => ({ ...p, responseTime: v }))} />
            <ThresholdSlider id="threshold-error-rate"    label="Error Rate"        value={thresholds.errorRate * 10} min={1} max={50} unit="×0.1%" color="#FF4D4D" onChange={(v) => setThresholds((p) => ({ ...p, errorRate: v / 10 }))} />
            <ThresholdSlider id="threshold-disk"         label="Disk Usage"        value={thresholds.diskUsage}    min={60} max={100} unit="%" color="#22C55E" onChange={(v) => setThresholds((p) => ({ ...p, diskUsage: v }))} />
          </div>
        </Section>

        {/* Notifications */}
        <Section
          icon={LucideIcons.Bell}
          title="Notification Preferences"
          description="Choose which alerts reach you and how"
          delay={0.18}
        >
          <div className="space-y-4">
            {(
              [
                { key: 'criticalAlerts',  label: 'Critical alerts',    desc: 'Always fire immediately'                    },
                { key: 'highAlerts',      label: 'High severity alerts', desc: 'Fires within 30 seconds'                  },
                { key: 'mediumAlerts',    label: 'Medium severity alerts', desc: 'Batched every 5 minutes'               },
                { key: 'emailDigest',     label: 'Daily email digest',  desc: 'Summarises all incidents from previous day' },
                { key: 'slackWebhook',    label: 'Slack webhook',       desc: 'Post alerts to Slack channel'              },
                { key: 'smsAlerts',       label: 'SMS critical alerts', desc: 'SMS for critical incidents only'           },
              ] as const
            ).map((n) => (
              <div key={n.key} className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-cs-dark-700/30 transition-all">
                <div>
                  <p className="text-sm font-medium text-cs-dark-50">{n.label}</p>
                  <p className="text-xs text-cs-dark-200 opacity-50 mt-0.5">{n.desc}</p>
                </div>
                <Toggle id={`toggle-${n.key}`} enabled={notifs[n.key]} onChange={(v) => setNotifs((p) => ({ ...p, [n.key]: v }))} />
              </div>
            ))}
          </div>
        </Section>

        {/* Agent Behaviour */}
        <Section
          icon={LucideIcons.Cpu}
          title="AI Agent Behaviour"
          description="Control what your swarm agents are permitted to do autonomously"
          delay={0.26}
        >
          <div className="space-y-4">
            {(
              [
                { key: 'autoScaling',      label: 'Auto-scaling',          desc: 'Allow AutoScaler-Alpha to provision/deprovision resources'   },
                { key: 'autoRemediation',  label: 'Auto-remediation',      desc: 'Allow agents to apply hotfixes without manual approval'      },
                { key: 'anomalyDetect',    label: 'Anomaly detection',     desc: 'Run continuous ML-based anomaly scanning'                    },
                { key: 'reportGeneration', label: 'Auto-generate reports',  desc: 'Compile post-incident reports automatically after resolution' },
                { key: 'maintenanceMode',  label: 'Maintenance mode',      desc: 'Suppress all non-critical alerts during planned maintenance'  },
              ] as const
            ).map((a) => (
              <div key={a.key} className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-cs-dark-700/30 transition-all">
                <div>
                  <p className="text-sm font-medium text-cs-dark-50">{a.label}</p>
                  <p className="text-xs text-cs-dark-200 opacity-50 mt-0.5">{a.desc}</p>
                </div>
                <Toggle id={`toggle-agent-${a.key}`} enabled={agents[a.key]} onChange={(v) => setAgents((p) => ({ ...p, [a.key]: v }))} />
              </div>
            ))}
          </div>

          {agents.maintenanceMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-start gap-2"
            >
              <LucideIcons.AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-400 opacity-90">
                Maintenance mode is <strong>active</strong> — only critical alerts will fire. Disable before going back to production.
              </p>
            </motion.div>
          )}
        </Section>

        {/* Display Preferences */}
        <Section
          icon={LucideIcons.Monitor}
          title="Display Preferences"
          description="Personalise your CrisisSwarm interface"
          delay={0.34}
        >
          <div className="space-y-4">
            {(
              [
                { key: 'autoRefresh',    label: 'Auto-refresh dashboards', desc: 'Refresh data every 30 seconds automatically' },
                { key: 'soundAlerts',    label: 'Sound alerts',            desc: 'Play audio for critical alerts'               },
                { key: 'compactMode',    label: 'Compact mode',            desc: 'Reduce padding for more information density'  },
                { key: 'showTimestamps', label: 'Show timestamps',         desc: 'Display exact timestamps in incident feed'    },
              ] as const
            ).map((p) => (
              <div key={p.key} className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-cs-dark-700/30 transition-all">
                <div>
                  <p className="text-sm font-medium text-cs-dark-50">{p.label}</p>
                  <p className="text-xs text-cs-dark-200 opacity-50 mt-0.5">{p.desc}</p>
                </div>
                <Toggle id={`toggle-pref-${p.key}`} enabled={prefs[p.key]} onChange={(v) => setPrefs((prev) => ({ ...prev, [p.key]: v }))} />
              </div>
            ))}
          </div>
        </Section>

        {/* Version info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <div className="text-center py-6 border-t border-cs-blue-400/8">
            <p className="text-xs text-cs-dark-200 opacity-30">CrisisSwarm v2.4.1 · Azure-powered · Built with Next.js 14</p>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
