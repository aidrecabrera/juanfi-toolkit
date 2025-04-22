import { describe, expect, it } from 'vitest';
import { parseVoucherFile } from './voucher';

describe('voucher file parser', () => {
  it('parses voucher and validity', () => {
    expect(parseVoucherFile('ABC123#12:30')).toEqual({
      voucher: 'ABC123',
      validity: '12:30',
      raw: 'ABC123#12:30',
    });
  });

  it('handles empty validity', () => {
    expect(parseVoucherFile('ABC123#')).toEqual({
      voucher: 'ABC123',
      validity: '',
      raw: 'ABC123#',
    });
  });
});
