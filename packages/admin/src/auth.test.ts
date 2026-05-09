import { describe, expect, it, vi } from 'vitest';
import { createJuanFiAdmin, parseLoginResponse } from './index';

describe('parseLoginResponse', () => {
  it('extracts token from ok|<token> payload', () => {
    const result = parseLoginResponse('ok|abc123def456');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.token).toBe('abc123def456');
      expect(result.raw).toBe('ok|abc123def456');
    }
  });

  it('trims whitespace around the response and token', () => {
    const result = parseLoginResponse('  ok|  9f17  \n');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.token).toBe('9f17');
    }
  });

  it('treats "ok" alone as a login failure (missing token)', () => {
    const result = parseLoginResponse('ok');
    expect(result.ok).toBe(false);
  });

  it('returns invalid for the plain "invalid" response', () => {
    const result = parseLoginResponse('invalid');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.toLowerCase()).toContain('invalid');
    }
  });

  it('returns the reason for invalid|<reason>', () => {
    const result = parseLoginResponse('invalid|bad credentials');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe('bad credentials');
    }
  });

  it('rejects ok| followed by an empty token', () => {
    const result = parseLoginResponse('ok|');
    expect(result.ok).toBe(false);
  });
});

describe('createJuanFiAdmin.validateLogin', () => {
  it('injects X-TOKEN header on subsequent calls after success', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = String(init?.body ?? '');
      const hasToken = new URLSearchParams(body).get('username') === 'admin';
      const headers = (init?.headers ?? {}) as Record<string, string>;

      /* login round. no X-TOKEN on wire yet */
      if (hasToken && !headers['X-TOKEN']) {
        return new Response('ok|TOKEN-A', { status: 200, headers: { 'Content-Type': 'text/plain' } });
      }
      /* logout body empty. auth only via X-TOKEN header */
      if (!body && headers['X-TOKEN'] === 'TOKEN-A') {
        return new Response('ok', { status: 200, headers: { 'Content-Type': 'text/plain' } });
      }
      return new Response('unexpected', { status: 500 });
    });

    const admin = createJuanFiAdmin({
      baseUrl: 'http://10.0.0.1',
      fetch: fetchMock as unknown as typeof fetch,
    });

    const login = await admin.validateLogin({ username: 'admin', password: 'secret' });
    expect(login.ok).toBe(true);
    expect(admin.getToken()).toBe('TOKEN-A');

    const out = await admin.logout();
    expect(out.ok).toBe(true);
    expect(admin.getToken()).toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not set token on failed login', async () => {
    const fetchMock = vi.fn(
      async () => new Response('invalid|bad password', { status: 200 }),
    );
    const admin = createJuanFiAdmin({
      baseUrl: '10.0.0.1',
      fetch: fetchMock as unknown as typeof fetch,
    });
    const result = await admin.validateLogin({ username: 'admin', password: 'wrong' });
    expect(result.ok).toBe(false);
    expect(admin.getToken()).toBeUndefined();
  });

  it('normalizes baseUrl (adds http:// scheme when missing)', async () => {
    let seenUrl = '';
    const fetchMock = vi.fn(async (url: string) => {
      seenUrl = url;
      return new Response('ok|T', { status: 200 });
    });
    const admin = createJuanFiAdmin({
      baseUrl: '10.0.0.1',
      fetch: fetchMock as unknown as typeof fetch,
    });
    await admin.validateLogin({ username: 'admin', password: 'x' });
    expect(seenUrl.startsWith('http://10.0.0.1/validateLogin')).toBe(true);
  });

  it('uses pre-seeded token without calling login', async () => {
    const fetchMock = vi.fn(async () => new Response('ok', { status: 200 }));
    const admin = createJuanFiAdmin({
      baseUrl: 'http://10.0.0.1',
      token: 'PRESEEDED',
      fetch: fetchMock as unknown as typeof fetch,
    });
    expect(admin.getToken()).toBe('PRESEEDED');
    await admin.logout();
    const call = fetchMock.mock.calls[0];
    expect(call).toBeDefined();
    const headers = (call![1] as RequestInit).headers as Record<string, string>;
    expect(headers['X-TOKEN']).toBe('PRESEEDED');
  });
});
