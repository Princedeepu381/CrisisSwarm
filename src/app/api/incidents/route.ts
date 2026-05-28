import { NextResponse } from 'next/server';
import { db, seedDatabase, persistIncident, persistTerminalLog } from '@/lib/db';
import { runSwarmAnalysis, isAzureOpenAIConfigured } from '@/lib/azureOpenAi';
import { pushStreamEvent } from '@/lib/stream';

// ─── Autonomous Lifecycle Engine ──────────────────────────────────────────────
// Every time the frontend polls GET /api/incidents, we check each incident's age
// and automatically advance it through stages:
//   DETECTED (active) → INVESTIGATING → MITIGATING → RESOLVED
// This creates the "living, intelligent system" illusion for the demo.

const LIFECYCLE_STAGES: { status: string; afterSeconds: number; label: string }[] = [
  { status: 'active',        afterSeconds: 0,   label: 'Detected' },
  { status: 'investigating', afterSeconds: 12,  label: 'Investigating' },
  { status: 'mitigating',    afterSeconds: 28,  label: 'Mitigating' },
  { status: 'resolved',      afterSeconds: 50,  label: 'Resolved' },
];

const AI_MESSAGES: Record<string, { agent: string; status: 'info' | 'warning' | 'success'; message: string }[]> = {
  investigating: [
    { agent: 'RootCause-Agent', status: 'info', message: 'Initiating root cause analysis on affected service...' },
    { agent: 'Telemetry-Agent', status: 'info', message: 'Correlating telemetry anomaly signals across regions' },
  ],
  mitigating: [
    { agent: 'Prediction-Agent', status: 'warning', message: 'Outage probability estimated at 73% — escalating remediation' },
    { agent: 'Remediation-Agent', status: 'info', message: 'Deploying automated container restart and load redistribution' },
  ],
  resolved: [
    { agent: 'Remediation-Agent', status: 'success', message: 'Autonomous remediation completed — all services restored' },
    { agent: 'Security-Agent', status: 'success', message: 'Post-incident security sweep passed. System integrity confirmed.' },
  ],
};

function tickLifecycle() {
  const now = Date.now();
  const autoRemediation = db.settings?.autoRemediation !== false; // default to true if undefined, but it is initialized to false

  for (const incident of db.incidents) {
    if (incident.status === 'resolved') continue;

    // Pause progression if the assigned agent is offline/stopped!
    const assignedAgent = db.agents.find(a => a.agent_name === incident.assigned_agent);
    if (assignedAgent && assignedAgent.status === 'offline') {
      continue;
    }

    const ageSeconds = (now - new Date(incident.created_at).getTime()) / 1000;

    // ─── Mitigating State Time-based Resolution ───
    if (incident.status === 'mitigating') {
      const elapsedSinceApproval = incident.approved_at 
        ? (now - new Date(incident.approved_at).getTime()) / 1000 
        : null;

      const shouldResolve = elapsedSinceApproval !== null 
        ? elapsedSinceApproval >= 15 
        : ageSeconds >= 50;

      if (shouldResolve) {
        incident.status = 'resolved';
        incident.resolved_at = new Date().toISOString();
        incident.timeline.push({
          time: new Date().toISOString(),
          event: `Resolved: ${getStageDescription('resolved', incident)}`,
        });

        const messages = AI_MESSAGES.resolved || [];
        for (const msg of messages) {
          const log = {
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: new Date().toLocaleTimeString(),
            agent: msg.agent,
            status: msg.status as 'success' | 'warning' | 'error' | 'info',
            message: `[${incident.id}] ${msg.message}`,
          };
          db.terminalLogs.unshift(log);
          pushStreamEvent({ type: 'terminal_log', data: log, timestamp: new Date().toISOString() });
          persistTerminalLog(log);
        }

        pushStreamEvent({
          type: 'incident_update',
          data: { id: incident.id, status: 'resolved', stage: 'Resolved', title: incident.title },
          timestamp: new Date().toISOString(),
        });

        db.alerts = db.alerts.filter(a => !a.message.includes(incident.title));
        persistIncident(incident);
      }
      continue;
    }

    // ─── Awaiting Approval Pause ───
    if (incident.status === 'awaiting_approval') {
      continue;
    }

    // ─── Transition Investigating → Awaiting Approval ───
    if (incident.status === 'investigating' && ageSeconds >= 28) {
      if (!autoRemediation) {
        incident.status = 'awaiting_approval';
        incident.timeline.push({
          time: new Date().toISOString(),
          event: `Awaiting Approval: Remediation-Agent proposed a container restart hotfix.`,
        });

        const appLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Remediation-Agent',
          status: 'warning' as const,
          message: `[${incident.id}] Proposed action: restart container deployment. Awaiting operator approval.`,
        };
        db.terminalLogs.unshift(appLog);
        pushStreamEvent({ type: 'terminal_log', data: appLog, timestamp: new Date().toISOString() });
        persistTerminalLog(appLog);

        pushStreamEvent({
          type: 'incident_update',
          data: { id: incident.id, status: 'awaiting_approval', stage: 'Awaiting Approval', title: incident.title },
          timestamp: new Date().toISOString(),
        });

        persistIncident(incident);
        continue;
      }
    }

    // ─── Normal Time-based Progression ───
    // Find the highest stage we should be at based on age
    let targetStage = LIFECYCLE_STAGES[0];
    for (const stage of LIFECYCLE_STAGES) {
      if (ageSeconds >= stage.afterSeconds) {
        // If autoRemediation is disabled, do not automatically advance beyond investigating
        if (!autoRemediation && (stage.status === 'mitigating' || stage.status === 'resolved')) {
          continue;
        }
        targetStage = stage;
      }
    }

    // Only advance forward, never backward
    const currentIdx = LIFECYCLE_STAGES.findIndex(s => s.status === incident.status);
    const targetIdx = LIFECYCLE_STAGES.findIndex(s => s.status === targetStage.status);

    if (targetIdx > currentIdx) {
      // Walk through each intermediate stage to generate logs
      for (let i = currentIdx + 1; i <= targetIdx; i++) {
        const stage = LIFECYCLE_STAGES[i];
        incident.status = stage.status as typeof incident.status;

        // Add timeline event
        incident.timeline.push({
          time: new Date().toISOString(),
          event: `${stage.label}: ${getStageDescription(stage.status, incident)}`,
        });

        // Generate AI terminal logs
        const messages = AI_MESSAGES[stage.status] || [];
        for (const msg of messages) {
          const log = {
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: new Date().toLocaleTimeString(),
            agent: msg.agent,
            status: msg.status as 'success' | 'warning' | 'error' | 'info',
            message: `[${incident.id}] ${msg.message}`,
          };
          db.terminalLogs.unshift(log);

          // Push to SSE stream
          pushStreamEvent({
            type: 'terminal_log',
            data: log,
            timestamp: new Date().toISOString(),
          });

          // Persist to database
          persistTerminalLog(log);
        }

        // Push incident status update to SSE
        pushStreamEvent({
          type: 'incident_update',
          data: {
            id: incident.id,
            status: incident.status,
            stage: stage.label,
            title: incident.title,
          },
          timestamp: new Date().toISOString(),
        });

        if (stage.status === 'resolved') {
          incident.resolved_at = new Date().toISOString();
          // Clean up alerts related to this incident
          db.alerts = db.alerts.filter(a => !a.message.includes(incident.title));
        }
      }

      // Persist updated incident
      persistIncident(incident);
    }
  }

  // Trim terminal logs to last 50
  if (db.terminalLogs.length > 50) {
    db.terminalLogs.length = 50;
  }
}

function getStageDescription(status: string, incident: { assigned_agent: string; affected_service: string }) {
  switch (status) {
    case 'investigating':
      return `Agent ${incident.assigned_agent} analysing ${incident.affected_service} telemetry`;
    case 'awaiting_approval':
      return `Remediation proposed. Awaiting operator approval.`;
    case 'mitigating':
      return `Autonomous remediation in progress on ${incident.affected_service}`;
    case 'resolved':
      return `Service ${incident.affected_service} fully recovered. Agent ${incident.assigned_agent} standing down.`;
    default:
      return 'Status updated';
  }
}

// ─── GET /api/incidents ───────────────────────────────────────────────────────

export async function GET() {
  // Ensure database is seeded
  await seedDatabase();

  // Run lifecycle engine on every poll
  tickLifecycle();

  const sorted = [...db.incidents].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return NextResponse.json(sorted);
}

// ─── POST /api/incidents ──────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, severity, affected_service, assigned_agent, impact } = body;

    if (!title || !description || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const agentsList = [
      'AutoScaler-Alpha',
      'MemoryOptimizer-Beta',
      'HealthMonitor-Gamma',
      'NetworkDefense-Delta',
      'ResponseUnit-Epsilon',
      'TelemetryStreamer-Zeta',
    ];
    const chosenAgent = assigned_agent || agentsList[Math.floor(Math.random() * agentsList.length)];

    const id = `INC-${String(db.incidents.length + 1).padStart(3, '0')}`;
    const newIncident = {
      id,
      severity: severity as 'critical' | 'high' | 'medium' | 'low',
      title,
      description,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      resolved_at: null,
      affected_service: affected_service || 'Unknown Service',
      assigned_agent: chosenAgent,
      impact: impact || 'Medium',
      timeline: [
        { time: new Date().toISOString(), event: `Incident detected and registered in CrisisSwarm database` },
        { time: new Date().toISOString(), event: `Agent ${chosenAgent} assigned for autonomous remediation` },
      ],
    };

    db.incidents.push(newIncident);

    // Add alert
    db.alerts.unshift({
      id: `alert-${Date.now()}`,
      type: severity === 'critical' ? 'cpu' : 'error_rate',
      severity: severity as 'critical' | 'high' | 'medium' | 'low',
      message: `${title} (${severity.toUpperCase()})`,
      created_at: new Date().toISOString(),
    });

    // Terminal log — dispatch
    const dispatchLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      agent: chosenAgent,
      status: 'warning' as const,
      message: `[${id}] Dispatched to resolve: ${title}`,
    };
    db.terminalLogs.unshift(dispatchLog);

    // Push to SSE
    pushStreamEvent({
      type: 'terminal_log',
      data: dispatchLog,
      timestamp: new Date().toISOString(),
    });
    pushStreamEvent({
      type: 'incident_update',
      data: { id, status: 'active', title, severity },
      timestamp: new Date().toISOString(),
    });

    // Persist to database
    persistIncident(newIncident);
    persistTerminalLog(dispatchLog);

    // ─── Trigger Azure OpenAI Swarm Analysis (async, non-blocking) ──────
    const aiMode = isAzureOpenAIConfigured() ? 'live' : 'simulated';

    // Fire-and-forget swarm analysis to stream results via SSE
    runSwarmAnalysis({
      id,
      title,
      description,
      severity,
      affected_service: affected_service || 'Unknown Service',
    }).then((result) => {
      // Stream each agent analysis as a terminal log
      for (const analysis of result.analyses) {
        const aiLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: analysis.agent,
          status: (analysis.confidence > 85 ? 'success' : 'info') as 'success' | 'info',
          message: `[${id}] ${analysis.analysis} (Confidence: ${analysis.confidence}%)`,
        };
        db.terminalLogs.unshift(aiLog);
        pushStreamEvent({ type: 'terminal_log', data: aiLog, timestamp: new Date().toISOString() });
        persistTerminalLog(aiLog);
      }

      // Push overall swarm result
      pushStreamEvent({
        type: 'swarm_analysis',
        data: result,
        timestamp: new Date().toISOString(),
      });
    }).catch((err) => {
      console.error('[Swarm Analysis Error]', err);
    });

    return NextResponse.json({ ...newIncident, aiMode }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process request: ' + String(err) }, { status: 500 });
  }
}

// ─── PATCH /api/incidents ─────────────────────────────────────────────────────

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const incident = db.incidents.find(i => i.id === id);
    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    const previousStatus = incident.status;
    incident.status = status as 'active' | 'investigating' | 'mitigating' | 'resolved' | 'awaiting_approval';

    if (status === 'resolved') {
      incident.resolved_at = new Date().toISOString();
      const isOverride = previousStatus === 'awaiting_approval';
      
      incident.timeline.push({
        time: new Date().toISOString(),
        event: isOverride 
          ? 'Operator rejected proposed swarm remediation and applied manual system override.'
          : 'Manual remediation completed. Incident marked as resolved.',
      });
      
      const resolveLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Operator',
        status: 'success' as const,
        message: isOverride 
          ? `[${incident.id}] Operator rejected proposed action and applied manual override. Incident resolved.`
          : `[${incident.id}] Remediated and resolved: ${incident.id}`,
      };
      
      db.terminalLogs.unshift(resolveLog);
      db.alerts = db.alerts.filter(a => !a.message.includes(incident.title));

      pushStreamEvent({ type: 'terminal_log', data: resolveLog, timestamp: new Date().toISOString() });
      persistTerminalLog(resolveLog);
    } else if (status === 'mitigating') {
      incident.approved_at = new Date().toISOString();
      
      incident.timeline.push({
        time: new Date().toISOString(),
        event: 'Operator approved autonomous swarm remediation plan.',
      });

      const approveLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Operator',
        status: 'success' as const,
        message: `[${incident.id}] Approved swarm action. Deploying automated container restart.`,
      };
      
      db.terminalLogs.unshift(approveLog);
      pushStreamEvent({ type: 'terminal_log', data: approveLog, timestamp: new Date().toISOString() });
      persistTerminalLog(approveLog);

      // Generate mitigating logs immediately for instant UI terminal feedback
      const messages = AI_MESSAGES.mitigating || [];
      for (const msg of messages) {
        const log = {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: msg.agent,
          status: msg.status as 'success' | 'warning' | 'error' | 'info',
          message: `[${incident.id}] ${msg.message}`,
        };
        db.terminalLogs.unshift(log);
        pushStreamEvent({ type: 'terminal_log', data: log, timestamp: new Date().toISOString() });
        persistTerminalLog(log);
      }

      pushStreamEvent({
        type: 'incident_update',
        data: {
          id: incident.id,
          status: 'mitigating',
          stage: 'Mitigating',
          title: incident.title,
        },
        timestamp: new Date().toISOString(),
      });
    } else if (status === 'investigating') {
      incident.timeline.push({
        time: new Date().toISOString(),
        event: `Agent ${incident.assigned_agent} began deep triage analysis`,
      });
      const triageLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: incident.assigned_agent,
        status: 'info' as const,
        message: `Began investigation on ${incident.id}`,
      };
      db.terminalLogs.unshift(triageLog);
      pushStreamEvent({ type: 'terminal_log', data: triageLog, timestamp: new Date().toISOString() });
      persistTerminalLog(triageLog);
    }

    // Persist
    persistIncident(incident);

    return NextResponse.json(incident);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process request: ' + String(err) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
