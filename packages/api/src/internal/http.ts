import type { ApiCore } from '../types';
import { networkError } from './error';

export function createCore(options: {
  readonly vendoIp: string;
  readonly fetch?: typeof fetch;
  readonly timeoutMs?: number;
}): ApiCore {
  return {
    baseUrl: normalizeBaseUrl(options.vendoIp),
    fetch: options.fetch ?? globalThis.fetch.bind(globalThis),
    timeoutMs: options.timeoutMs ?? 10_000,
  };
}

export function normalizeBaseUrl(vendoIp: string): string {
  const trimmed = vendoIp.trim().replace(/\/$/, '');
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `http://${trimmed}`;
}

export function buildVendoUrl(core: ApiCore, path: string, query?: Record<string, string>): string {
  const url = new URL(path, `${core.baseUrl}/`);
  for (const [key, value] of Object.entries(query ?? {})) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export async function getText(core: ApiCore, path: string, query?: Record<string, string>): Promise<string> {
  const response = await request(core, buildVendoUrl(core, path, query), { method: 'GET' });
  return response.text();
}

export async function getArrayBuffer(core: ApiCore, path: string, query?: Record<string, string>): Promise<ArrayBuffer> {
  const response = await request(core, buildVendoUrl(core, path, query), { method: 'GET' });
  return response.arrayBuffer();
}

export async function getRelativeText(core: ApiCore, path: string): Promise<string> {
  const response = await request(core, path, { method: 'GET' });
  return response.text();
}

export async function postForm(core: ApiCore, path: string, data: Record<string, string>): Promise<unknown> {
  const response = await request(core, buildVendoUrl(core, path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: new URLSearchParams(data).toString(),
  });

  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();
  if (contentType.includes('application/json') || looksLikeJson(text)) {
    return JSON.parse(text);
  }
  return text;
}

async function request(core: ApiCore, url: string, init: RequestInit): Promise<Response> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  const timeout = controller
    ? globalThis.setTimeout(() => controller.abort(), core.timeoutMs)
    : undefined;

  try {
    const response = await core.fetch(url, {
      ...init,
      signal: controller?.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response;
  } catch (error) {
    throw networkError(error);
  } finally {
    if (timeout !== undefined) globalThis.clearTimeout(timeout);
  }
}

function looksLikeJson(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}
