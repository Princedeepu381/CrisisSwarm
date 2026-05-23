import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  // Trigger a warning alert in the database
  const alertId = `alert-${Date.now()}`;
  db.alerts.unshift({
    id: alertId,
    type: 'error_rate',
    severity: 'high',
    message: 'Outage simulation triggered by developer console (/api/error)',
    created_at: new Date().toISOString()
  });

  db.terminalLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    agent: 'HealthMonitor-Gamma',
    status: 'error',
    message: 'Outage test: Simulated service failure event occurred'
  });

  return NextResponse.json(
    { error: 'Simulated Outage: Critical connection pool termination.' },
    { status: 500 }
  );
}

export const dynamic = 'force-dynamic';
