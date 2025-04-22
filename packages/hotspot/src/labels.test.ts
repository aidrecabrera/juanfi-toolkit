import { describe, expect, it } from 'vitest';
import { englishLabels } from './labels';

describe('labels', () => {
  it('contains backend error code labels', () => {
    expect(englishLabels.errors['coin.not.inserted']).toBe('Coin not inserted');
    expect(englishLabels.errors['eload.failed']).toBe('E-load failed');
  });
});
