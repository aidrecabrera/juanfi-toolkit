import type { JuanFiResult } from '../types';
import { parseError } from './error';

export function asRecord(value: unknown, raw?: string): Record<string, unknown> {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  throw parseError('Expected object response', raw);
}

export function parseJsonObject(raw: string): Record<string, unknown> {
  try {
    return asRecord(JSON.parse(raw), raw);
  } catch (error) {
    if (error instanceof Error && error.name === 'JuanFiApiError') throw error;
    throw parseError('Expected JSON object response', raw);
  }
}

export function parseObjectLike(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return {};
    return parseJsonObject(trimmed);
  }
  return asRecord(value);
}

export function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  if (value === undefined || value === null) return undefined;
  return String(value);
}

export function readNumber(record: Record<string, unknown>, key: string): number {
  const value = readString(record, key);
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isTrueStatus(record: Record<string, unknown>): boolean {
  return readString(record, 'status') === 'true' || record.status === true;
}

export function toResult<T>(record: Record<string, unknown>, data: T): JuanFiResult<T> {
  if (isTrueStatus(record)) return { ok: true, data };
  return {
    ok: false,
    code: readString(record, 'errorCode') ?? 'unknown',
    data: record,
  };
}

export function splitRows(raw: string): string[] {
  return raw
    .split('|')
    .map((row) => row.trim())
    .filter((row) => row.length > 0);
}

export function splitColumns(row: string): string[] {
  return row.split('#').map((value) => value.trim());
}
