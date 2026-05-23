import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'CrisisSwarm Azure Serverless Backend API',
    status: 'online',
    version: '1.0.0',
    environment: 'production',
    region: 'Azure Southeast Asia',
    timestamp: new Date().toISOString(),
  });
}
export const dynamic = 'force-dynamic';
