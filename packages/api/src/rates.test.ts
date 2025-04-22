import { describe, expect, it } from 'vitest';
import { parseRates } from './rates';

describe('rates parser', () => {
  it('parses pipe/hash promo rates', () => {
    const rates = parseRates('P5#x#x#60#100|P10#x#x#180#');

    expect(rates).toEqual([
      expect.objectContaining({ rate: 'P5', validityMinutes: 60, dataMb: '100' }),
      expect.objectContaining({ rate: 'P10', validityMinutes: 180, dataMb: undefined }),
    ]);
  });
});
