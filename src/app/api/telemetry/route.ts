import { NextResponse } from 'next/server';

export async function GET() {
  const now = new Date();
  const data = [];

  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600 * 1000);
    const hourStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Simulate daily traffic cycle (sine wave peaking in late afternoon)
    const hour = d.getHours();
    const loadFactor = Math.sin((hour - 5) * Math.PI / 12) * 0.35 + 0.6; // Ranges from 0.25 to 0.95
    
    const cpu = Math.min(98, Math.max(10, Math.floor(30 + loadFactor * 45 + Math.random() * 6)));
    const memory = Math.min(98, Math.max(15, Math.floor(40 + loadFactor * 38 + Math.random() * 4)));
    const responseTime = Math.min(1200, Math.max(45, Math.floor(80 + loadFactor * 240 + Math.random() * 25)));
    const errorRate = parseFloat(Math.max(0.0, loadFactor * 0.6 + (Math.random() * 0.3) - 0.1).toFixed(2));
    
    data.push({
      time: hourStr,
      cpu,
      memory,
      responseTime,
      errorRate
    });
  }

  return NextResponse.json(data);
}

export const dynamic = 'force-dynamic';
