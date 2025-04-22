import { describe, expect, it } from 'vitest';
import { groupLoadProducts, parseLoadProducts } from './eload';

describe('eload parser', () => {
  it('parses and groups product rows', () => {
    const products = parseLoadProducts('LD10,Load 10,10,Regular,h1\nLD20,Load 20,20,Regular,h2\nP50,Promo 50,50,Promo,h3');
    const groups = groupLoadProducts(products);

    expect(groups.Regular).toHaveLength(2);
    expect(groups.Promo?.[0]).toEqual(
      expect.objectContaining({ code: 'P50', name: 'Promo 50', price: 50, hash: 'h3' }),
    );
  });
});
