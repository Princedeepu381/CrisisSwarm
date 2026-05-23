import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const now = new Date();
  const data = [];

  // Count active critical/high incidents to create visible chart spikes
  const activeCritical = db.incidents.filter(
    i => i.status !== 'resolved' && (i.severity === 'critical' || i.severity === 'high')
  ).length;
  const crisisMultiplier = activeCritical > 0 ? 1.0 + activeCritical * 0.35 : 1.0;

  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600 * 1000);
    const hourStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    // Simulate daily traffic cycle (sine wave peaking in late afternoon)
    const hour = d.getHours();
    const loadFactor = Math.sin((hour - 5) * Math.PI / 12) * 0.35 + 0.6;

    // Apply crisis spike to the most recent 3 hours
    const isCrisisWindow = i <= 2 && activeCritical > 0;
    const spike = isCrisisWindow ? crisisMultiplier : 1.0;

    const cpu = Math.min(98, Math.max(10, Math.floor((30 + loadFactor * 45) * spike + Math.random() * 8)));
    const memory = Math.min(98, Math.max(15, Math.floor((40 + loadFactor * 38) * spike + Math.random() * 6)));
    const responseTime = Math.min(1500, Math.max(45, Math.floor((80 + loadFactor * 240) * spike + Math.random() * 30)));
    const errorRate = parseFloat(
      Math.max(0.0, (loadFactor * 0.6 * spike) + (Math.random() * 0.4) - 0.1).toFixed(2)
    );

    data.push({ time: hourStr, cpu, memory, responseTime, errorRate });
  }

  return NextResponse.json(data);
}

export const dynamic = 'force-dynamic';
