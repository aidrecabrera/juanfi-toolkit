import { describe, expect, it, vi } from 'vitest';
import { createJuanFiApi } from './client';

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('coin api', () => {
  it('startTopup sends form-encoded POST', async () => {
    const fetch = vi.fn(async () => jsonResponse({ status: 'true', voucher: 'ABC123' }));
    const api = createJuanFiApi({ vendoIp: '10.1.0.41', fetch });

    await api.startTopup({ voucher: '', mac: 'AA:BB', extendTime: false });

    expect(fetch).toHaveBeenCalledWith(
      'http://10.1.0.41/topUp',
      expect.objectContaining({
        method: 'POST',
        body: 'voucher=&mac=AA%3ABB&extendTime=0',
      }),
    );
  });

  it('checkCoin parses success response', async () => {
    const fetch = vi.fn(async () =>
      jsonResponse({
        status: 'true',
        totalCoin: '5',
        newCoin: '1',
        timeAdded: '3600',
        data: '100',
        validity: '60',
      }),
    );
    const api = createJuanFiApi({ vendoIp: '10.1.0.41', fetch });

    const result = await api.checkCoin({ voucher: 'ABC123' });

    expect(result).toEqual({
      ok: true,
      data: expect.objectContaining({
        totalCoin: 5,
        newCoin: 1,
        timeAdded: 3600,
        data: '100',
        validity: '60',
      }),
    });
  });

  it('checkCoin preserves backend error code', async () => {
    const fetch = vi.fn(async () =>
      jsonResponse({
        status: 'false',
        errorCode: 'coin.not.inserted',
        remainTime: '30000',
        waitTime: '60000',
        totalCoin: '0',
      }),
    );
    const api = createJuanFiApi({ vendoIp: '10.1.0.41', fetch });

    const result = await api.checkCoin({ voucher: 'ABC123' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('coin.not.inserted');
  });
});
