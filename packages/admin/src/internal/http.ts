import { JuanFiAdminError } from '../errors';
import type { AdminCore } from '../types';

export function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/$/, '');
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `http://${trimmed}`;
}

export function buildUrl(core: AdminCore, path: string, query?: Record<string, string | undefined>): string {
  const url = new URL(path, `${core.baseUrl}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

function authHeaders(core: AdminCore): Record<string, string> {
  const token = core.state.token;
  return token ? { 'X-TOKEN': token } : {};
}

/*
 * AbortSignal timeout, merge X-TOKEN from core.state.token,
 * normalize failures to JuanFiAdminError (AbortError counts as timeout)
 */
async function request(
  core: AdminCore,
  url: string,
  init: RequestInit,
  extraHeaders?: Record<string, string>,
): Promise<Response> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  const timeout = controller
    ? globalThis.setTimeout(() => controller.abort(), core.timeoutMs)
    : undefined;

  try {
    const response = await core.fetch(url, {
      ...init,
      signal: controller?.signal,
      headers: {
        ...(init.headers as Record<string, string> | undefined),
        ...authHeaders(core),
        ...extraHeaders,
      },
    });
    if (response.status === 401) {
      throw new JuanFiAdminError({
        type: 'unauthorized',
        message: 'Unauthorized',
        status: response.status,
      });
    }
    if (response.status === 403) {
      throw new JuanFiAdminError({
        type: 'forbidden',
        message: 'Forbidden',
        status: response.status,
      });
    }
    if (!response.ok) {
      throw new JuanFiAdminError({
        type: 'network',
        message: `HTTP ${response.status}`,
        status: response.status,
      });
    }
    return response;
  } catch (error) {
    throw normalizeError(error);
  } finally {
    if (timeout !== undefined) globalThis.clearTimeout(timeout);
  }
}

function normalizeError(error: unknown): JuanFiAdminError {
  if (error instanceof JuanFiAdminError) return error;
  if (error instanceof Error && error.name === 'AbortError') {
    return new JuanFiAdminError({ type: 'timeout', message: 'Request timed out' });
  }
  const message = error instanceof Error ? error.message : 'Network request failed';
  return new JuanFiAdminError({ type: 'network', message });
}

/** firmware usually sends text/plain here */
export async function getText(
  core: AdminCore,
  path: string,
  query?: Record<string, string | undefined>,
): Promise<string> {
  const response = await request(core, buildUrl(core, path, query), { method: 'GET' });
  return response.text();
}

/** application/x-www-form-urlencoded. undefined keys skipped */
export async function postForm(
  core: AdminCore,
  path: string,
  body: Record<string, string | undefined>,
  query?: Record<string, string | undefined>,
): Promise<string> {
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    filtered[key] = value;
  }

  const response = await request(
    core,
    buildUrl(core, path, query),
    {
      method: 'POST',
      body: new URLSearchParams(filtered).toString(),
    },
    { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  );
  return response.text();
}

/** POST body is data=<encoded string>, firmware pipe-blob save endpoints */
export async function postData(
  core: AdminCore,
  path: string,
  data: string,
  query?: Record<string, string | undefined>,
): Promise<string> {
  const body = new URLSearchParams({ data }).toString();
  const response = await request(
    core,
    buildUrl(core, path, query),
    {
      method: 'POST',
      body,
    },
    { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  );
  return response.text();
}

/** POST no body, still sends auth headers */
export async function postEmpty(core: AdminCore, path: string): Promise<string> {
  const response = await request(core, buildUrl(core, path), { method: 'POST' });
  return response.text();
}

/** multipart: leave Content-Type alone so fetch sets boundary */
export async function postUpload(
  core: AdminCore,
  path: string,
  form: FormData,
): Promise<string> {
  // manual Content-Type breaks multipart boundary
  const response = await request(core, buildUrl(core, path), {
    method: 'POST',
    body: form,
  });
  return response.text();
}
