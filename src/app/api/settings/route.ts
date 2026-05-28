import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json(db.settings);
}

export async function POST(req: Request) {
  try {
    const body: any = await req.json();
    db.settings = {
      // AI Agent Behaviour
      autoScaling:      body.autoScaling !== undefined ? !!body.autoScaling : true,
      autoRemediation:  body.autoRemediation !== undefined ? !!body.autoRemediation : true,
      anomalyDetect:    body.anomalyDetect !== undefined ? !!body.anomalyDetect : true,
      reportGeneration: !!body.reportGeneration,
      maintenanceMode:  !!body.maintenanceMode,
      
      // Notification Preferences
      criticalAlerts:  body.criticalAlerts !== undefined ? !!body.criticalAlerts : true,
      highAlerts:      body.highAlerts !== undefined ? !!body.highAlerts : true,
      mediumAlerts:    !!body.mediumAlerts,
      emailDigest:     body.emailDigest !== undefined ? !!body.emailDigest : true,
      slackWebhook:    !!body.slackWebhook,
      smsAlerts:       !!body.smsAlerts,

      // Alert Thresholds
      cpu:          body.cpu !== undefined ? Number(body.cpu) : 80,
      memory:       body.memory !== undefined ? Number(body.memory) : 85,
      responseTime: body.responseTime !== undefined ? Number(body.responseTime) : 300,
      errorRate:    body.errorRate !== undefined ? Number(body.errorRate) : 1.0,
      diskUsage:    body.diskUsage !== undefined ? Number(body.diskUsage) : 90,

      // Display Preferences
      autoRefresh:    body.autoRefresh !== undefined ? !!body.autoRefresh : true,
      soundAlerts:    !!body.soundAlerts,
      compactMode:    !!body.compactMode,
      showTimestamps: body.showTimestamps !== undefined ? !!body.showTimestamps : true,
    };
    return NextResponse.json({ success: true, settings: db.settings });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid settings body: ' + String(err) }, { status: 400 });
  }
}

export const dynamic = 'force-dynamic';
