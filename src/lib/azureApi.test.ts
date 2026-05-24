import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { azureApi } from './azureApi';

describe('azureApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('window', {
      location: {
        origin: 'http://example.com',
        hostname: 'example.com'
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getRoot calls the correct local origin endpoint mapped to /api', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'ok' })
    } as unknown as Response);

    const result = await azureApi.getRoot();

    expect(mockFetch).toHaveBeenCalledWith(
      'http://example.com/api',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      })
    );
    expect(result.data).toEqual({ message: 'ok' });
    expect(result.error).toBeNull();
  });

  it('getHealth calls /api/health', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ status: 'healthy' })
    } as unknown as Response);

    const result = await azureApi.getHealth();

    expect(mockFetch).toHaveBeenCalledWith('http://example.com/api/health', expect.any(Object));
    expect(result.data).toEqual({ status: 'healthy' });
  });

  it('triggerError calls /api/error', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'test error' })
    } as unknown as Response);

    const result = await azureApi.triggerError();

    expect(mockFetch).toHaveBeenCalledWith('http://example.com/api/error', expect.any(Object));
    expect(result.data).toEqual({ error: 'test error' });
  });
});
