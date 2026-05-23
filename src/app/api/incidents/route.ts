import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  // Sort incidents by created_at descending so newest are on top
  const sorted = [...db.incidents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return NextResponse.json(sorted);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, severity, affected_service, assigned_agent, impact } = body;

    if (!title || !description || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Auto-select agent if not specified
    const agentsList = ['AutoScaler-Alpha', 'MemoryOptimizer-Beta', 'HealthMonitor-Gamma', 'NetworkDefense-Delta', 'ResponseUnit-Epsilon'];
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
        { time: new Date().toISOString(), event: `Incident detected and registered in database` },
        { time: new Date().toISOString(), event: `Agent ${chosenAgent} assigned for autonomous remediation` }
      ]
    };

    db.incidents.push(newIncident);

    // Add alert for the incident
    const alertId = `alert-${Date.now()}`;
    db.alerts.unshift({
      id: alertId,
      type: severity === 'critical' ? 'cpu' : 'error_rate',
      severity: severity as 'critical' | 'high' | 'medium' | 'low',
      message: `${title} (${severity.toUpperCase()})`,
      created_at: new Date().toISOString()
    });

    // Add a log entry in terminal logs
    db.terminalLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      agent: chosenAgent,
      status: 'warning',
      message: `Dispatched to resolve: ${title}`
    });

    return NextResponse.json(newIncident, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process request: ' + String(err) }, { status: 500 });
  }
}

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

    incident.status = status as 'active' | 'investigating' | 'resolved';
    if (status === 'resolved') {
      incident.resolved_at = new Date().toISOString();
      incident.timeline.push({
        time: new Date().toISOString(),
        event: 'Remediation completed. Incident marked as resolved.'
      });

      // Log success in terminal
      db.terminalLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: incident.assigned_agent,
        status: 'success',
        message: `Remediated and resolved: ${incident.id}`
      });

      // Remove alert if matched
      db.alerts = db.alerts.filter(a => !a.message.includes(incident.title));
    } else if (status === 'investigating') {
      incident.timeline.push({
        time: new Date().toISOString(),
        event: `Agent ${incident.assigned_agent} began deep triage analysis`
      });
      db.terminalLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: incident.assigned_agent,
        status: 'info',
        message: `Began investigation on ${incident.id}`
      });
    }

    return NextResponse.json(incident);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process request: ' + String(err) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
