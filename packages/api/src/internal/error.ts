import { JuanFiApiError } from '../types';

export function parseError(message: string, raw?: string): JuanFiApiError {
  return new JuanFiApiError({ type: 'parse', message, raw });
}

export function networkError(error: unknown): JuanFiApiError {
  if (error instanceof JuanFiApiError) return error;
  if (error instanceof Error && error.name === 'AbortError') {
    return new JuanFiApiError({ type: 'timeout', message: 'Request timed out' });
  }
  const message = error instanceof Error ? error.message : 'Network request failed';
  return new JuanFiApiError({ type: 'network', message });
}
