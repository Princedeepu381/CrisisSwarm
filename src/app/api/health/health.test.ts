import { describe, it, expect } from 'vitest';
import { GET } from './route';
import { db } from '@/lib/db';

describe('Health API Route', () => {
  it('returns healthy status when there are no critical incidents', async () => {
    db.incidents = [];
    db.alerts = [];

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.cpu).toBeGreaterThanOrEqual(5);
    expect(data.cpu).toBeLessThanOrEqual(99);
    expect(data.memory.percentage).toBeDefined();
    expect(data.services.database).toBe('healthy');
  });

  it('returns unhealthy status when there is a critical incident', async () => {
    db.incidents = [
      {
        id: 'inc-1',
        severity: 'critical',
        title: 'Critical DB Failure',
        description: 'Primary database node unreachable',
        status: 'active',
        created_at: new Date().toISOString(),
        resolved_at: null,
        affected_service: 'Database',
        assigned_agent: 'analyzer',
        impact: 'High',
        timeline: []
      }
    ];

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('unhealthy');
    expect(data.services.database).toBe('degraded');
  });
});
