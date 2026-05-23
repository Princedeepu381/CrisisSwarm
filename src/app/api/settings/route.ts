import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json(db.settings);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    db.settings = {
      autoScaling: !!body.autoScaling,
      autoRemediation: !!body.autoRemediation,
      anomalyDetect: !!body.anomalyDetect,
      reportGeneration: !!body.reportGeneration,
      maintenanceMode: !!body.maintenanceMode,
    };
    return NextResponse.json({ success: true, settings: db.settings });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid settings body: ' + String(err) }, { status: 400 });
  }
}

export const dynamic = 'force-dynamic';
