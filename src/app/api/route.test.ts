import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('Root API Route', () => {
  it('returns standard status metadata', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('online');
    expect(data.message).toBe('CrisisSwarm Azure Serverless Backend API');
    expect(data.environment).toBe('production');
    expect(data.region).toBe('Azure Southeast Asia');
    expect(data.version).toBe('1.0.0');
    expect(data.timestamp).toBeDefined();
  });
});
