import { describe, expect, it } from 'vitest';
import { generateString } from './eload';

describe('eload helpers', () => {
  it('generates the requested transaction length', () => {
    expect(generateString(15)).toHaveLength(15);
  });
});
