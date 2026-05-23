import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json(db.alerts);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, severity, message } = body;

    if (!type || !severity || !message) {
      return NextResponse.json({ error: 'Missing type, severity, or message' }, { status: 400 });
    }

    const newAlert = {
      id: `alert-${Date.now()}`,
      type: type as 'cpu' | 'memory' | 'response_time' | 'error_rate',
      severity: severity as 'critical' | 'high' | 'medium' | 'low',
      message,
      created_at: new Date().toISOString()
    };

    db.alerts.unshift(newAlert);

    // Also push a terminal log
    db.terminalLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      agent: 'HealthMonitor-Gamma',
      status: 'error',
      message: `System Alert: ${message}`
    });

    return NextResponse.json(newAlert, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed: ' + String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      db.alerts = db.alerts.filter(a => a.id !== id);
    } else {
      // Clear all
      db.alerts = [];
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed: ' + String(err) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
