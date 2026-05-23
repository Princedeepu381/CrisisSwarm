import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  // Simulate active stats with slight fluctuations
  const activeAlertsCount = db.alerts.length;
  const criticalIncidents = db.incidents.filter(i => i.status !== 'resolved' && i.severity === 'critical').length;
  
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (criticalIncidents > 0) {
    status = 'unhealthy';
  } else if (activeAlertsCount > 2) {
    status = 'degraded';
  }

  // Generate pseudo-random metrics around bases
  const baseCpu = status === 'unhealthy' ? 88 : status === 'degraded' ? 68 : 42;
  const cpu = Math.min(99, Math.max(5, baseCpu + Math.floor(Math.random() * 11) - 5));
  
  const baseMem = status === 'unhealthy' ? 82 : status === 'degraded' ? 70 : 54;
  const memPct = Math.min(99, Math.max(10, baseMem + Math.floor(Math.random() * 5) - 2));
  const memoryTotal = 16.0; // GB
  const memoryUsed = parseFloat(((memPct / 100) * memoryTotal).toFixed(2));

  // Sync back to db.metrics for global updates
  db.metrics.system_health = status === 'healthy' ? 98 : status === 'degraded' ? 74 : 45;
  db.metrics.cpu_avg = cpu;
  db.metrics.memory_avg = memPct;
  db.metrics.active_alerts = activeAlertsCount;
  db.metrics.total_incidents = db.incidents.filter(i => i.status !== 'resolved').length;

  return NextResponse.json({
    status,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    cpu,
    memory: {
      used: memoryUsed,
      total: memoryTotal,
      percentage: memPct,
    },
    services: {
      database: criticalIncidents > 0 ? 'degraded' : 'healthy',
      cache: activeAlertsCount > 3 ? 'degraded' : 'healthy',
      insights: 'healthy',
    },
    region: 'Azure Southeast Asia',
    version: '1.0.0',
    environment: 'production',
  });
}

export const dynamic = 'force-dynamic';
