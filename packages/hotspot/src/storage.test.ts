import { describe, expect, it } from 'vitest';
import { readValue, removeValue, saveValue } from './storage';

describe('storage helpers', () => {
  it('saves, reads, and removes localStorage values', () => {
    const data = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        setItem: (key: string, value: string) => data.set(key, value),
        getItem: (key: string) => data.get(key) ?? null,
        removeItem: (key: string) => data.delete(key),
      },
      configurable: true,
    });

    saveValue('activeVoucher', 'ABC123');
    expect(readValue('activeVoucher')).toBe('ABC123');
    removeValue('activeVoucher');
    expect(readValue('activeVoucher')).toBeNull();
  });
});
