'use client';

import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import AzureMonitorPanel from '@/components/azure/AzureMonitorPanel';
import GlassCard from '@/components/common/GlassCard';
import { useAzureHealth } from '@/hooks/useAzureData';
import AzureConnectionBadge from '@/components/common/AzureConnectionBadge';
import * as LucideIcons from 'lucide-react';
import { AZURE_BASE_URL } from '@/lib/azureApi';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const AZURE_STACK = [
  { icon: 'Server',      label: 'Runtime',         value: 'Next.js 14 Serverless API', color: 'text-cs-accent-success' },
  { icon: 'Cloud',       label: 'Platform',        value: 'Azure Static Web Apps',    color: 'text-cs-blue-400'       },
  { icon: 'BarChart2',   label: 'Telemetry',       value: 'Dynamic Server Diagnostics', color: 'text-purple-400'         },
  { icon: 'Bell',        label: 'Alerting',        value: 'AI Swarm Coordinator',      color: 'text-orange-400'         },
  { icon: 'Database',    label: 'Logs',            value: 'In-Memory State Logs',     color: 'text-indigo-400'         },
  { icon: 'Globe',       label: 'Region',          value: 'Southeast Asia',       color: 'text-yellow-400'         },
];

const AZURE_FEATURES = [
  { icon: 'Activity',    label: 'Real-time request logging',          done: true  },
  { icon: 'Heart',       label: 'Health endpoint monitoring',         done: true  },
  { icon: 'AlertCircle', label: 'Failure simulation (/error)',        done: true  },
  { icon: 'Eye',         label: 'Application telemetry',             done: true  },
  { icon: 'Bell',        label: 'FailedRequestsAlert configured',     done: true  },
  { icon: 'Clock',       label: 'ServerResponseTimeAlert configured', done: true  },
  { icon: 'Database',    label: 'Database connectivity',             done: false },
  { icon: 'Lock',        label: 'Authentication system',             done: false },
  { icon: 'Cpu',         label: 'AI agent API endpoints',            done: false },
  { icon: 'Wifi',        label: 'WebSocket real-time streaming',     done: false },
];

export default function AzurePage() {
  const { status, latencyMs, lastChecked, refresh } = useAzureHealth(30000);

  return (
    <MainLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-cs-blue-400/10 bg-gradient-to-b from-cs-dark-600/90 via-cs-dark-700/80 to-transparent backdrop-blur-xl">
        <div className="px-6 md:px-8 py-5">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-cs-dark-50 mb-1 flex items-center gap-3">
                <LucideIcons.CloudCog className="w-8 h-8 text-cs-blue-400" />
                Azure Integration
              </h1>
              <p className="text-sm text-cs-dark-200 opacity-60">
                Live backend monitoring · Southeast Asia region
              </p>
            </div>
            <AzureConnectionBadge
              status={status}
              latencyMs={latencyMs}
              lastChecked={lastChecked}
              onRefresh={refresh}
            />
          </motion.div>
        </div>
      </div>

      <motion.div
        className="p-6 md:p-8 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Live Banner */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-2xl border border-cs-blue-400/20 bg-gradient-to-br from-cs-blue-500/10 via-cs-dark-700/50 to-cs-dark-800/80 p-6">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cs-blue-400/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cs-accent-success animate-pulse" />
                  <span className="text-sm font-bold text-cs-accent-success uppercase tracking-widest">
                    Backend Operational
                  </span>
                </div>
                <p className="text-cs-dark-50 font-bold text-xl mb-1">CrisisSwarm Azure App Service</p>
                <a
                  href={AZURE_BASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-cs-blue-400 hover:underline opacity-80 flex items-center gap-1.5"
                >
                  <LucideIcons.ExternalLink className="w-3.5 h-3.5" />
                  {AZURE_BASE_URL.replace('https://', '')}
                </a>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-xs text-cs-dark-200 opacity-50">Deployed via</span>
                <span className="text-sm font-bold text-cs-dark-50">Kudu ZIP Deploy</span>
                <span className="text-xs text-cs-dark-200 opacity-50">Azure App Service Plan</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main grid: monitor panel + right column */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monitor Panel — takes 2 cols */}
          <div className="lg:col-span-2">
            <AzureMonitorPanel />
          </div>

          {/* Right col: stack + roadmap */}
          <div className="space-y-4">
            {/* Tech Stack */}
            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-cs-dark-50 mb-4 flex items-center gap-2">
                <LucideIcons.Layers className="w-4 h-4 text-cs-blue-400" />
                Backend Stack
              </h3>
              <div className="space-y-3">
                {AZURE_STACK.map((s, idx) => {
                  const Icon = (LucideIcons[s.icon as keyof typeof LucideIcons] as React.ElementType) ?? LucideIcons.Circle;
                  return (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.07 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`p-1.5 rounded-lg bg-cs-dark-700/60 border border-cs-blue-400/10`}>
                        <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-cs-dark-200 opacity-50">{s.label}</p>
                        <p className={`text-xs font-semibold ${s.color}`}>{s.value}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Architecture diagram (text) */}
            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-cs-dark-50 mb-4 flex items-center gap-2">
                <LucideIcons.GitBranch className="w-4 h-4 text-purple-400" />
                Architecture Flow
              </h3>
              <div className="space-y-1.5 font-mono text-xs">
                {[
                  { label: 'Users',                  arrow: false, color: 'text-cs-dark-50'        },
                  { label: '↓',                       arrow: true,  color: 'text-cs-blue-400/40'    },
                  { label: 'CrisisSwarm UI',         arrow: false, color: 'text-cs-blue-400'        },
                  { label: '↓  Relative API Path',    arrow: true,  color: 'text-cs-blue-400/40'    },
                  { label: 'Next.js API Routes',     arrow: false, color: 'text-cs-accent-success'  },
                  { label: '↓',                       arrow: true,  color: 'text-cs-blue-400/40'    },
                  { label: 'AI Swarm Coordinator',    arrow: false, color: 'text-purple-400'          },
                  { label: '↓',                       arrow: true,  color: 'text-cs-blue-400/40'    },
                  { label: 'Azure Static Web Apps',   arrow: false, color: 'text-indigo-400'          },
                ].map((n, i) => (
                  <div key={i} className={`${n.color} ${n.arrow ? 'pl-4 opacity-60' : 'px-2 py-1 rounded bg-cs-dark-700/40 border border-cs-blue-400/8'}`}>
                    {n.label}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {/* Feature checklist */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <h3 className="text-base font-semibold text-cs-dark-50 mb-4 flex items-center gap-2">
              <LucideIcons.CheckSquare className="w-5 h-5 text-cs-accent-success" />
              Observability Capabilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {AZURE_FEATURES.map((f, idx) => {
                const Icon = (LucideIcons[f.icon as keyof typeof LucideIcons] as React.ElementType) ?? LucideIcons.Circle;
                return (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all
                      ${f.done
                        ? 'border-cs-accent-success/20 bg-cs-accent-success/5'
                        : 'border-cs-blue-400/8 bg-cs-dark-700/20 opacity-50'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${f.done ? 'bg-cs-accent-success/20' : 'bg-cs-dark-700/60'}`}>
                      {f.done
                        ? <LucideIcons.Check className="w-3 h-3 text-cs-accent-success" />
                        : <LucideIcons.Clock className="w-3 h-3 text-cs-dark-200 opacity-40" />
                      }
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${f.done ? 'text-cs-accent-success' : 'text-cs-dark-200 opacity-40'}`} />
                      <span className={`text-xs ${f.done ? 'text-cs-dark-100' : 'text-cs-dark-200 opacity-50'}`}>
                        {f.label}
                      </span>
                    </div>
                    {!f.done && <span className="ml-auto text-[9px] text-yellow-400 font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded flex-shrink-0">ROADMAP</span>}
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
