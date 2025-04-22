import { describe, expect, it } from 'vitest';
import { parseChargingPorts } from './charging';

describe('charging parser', () => {
  it('parses charging station rows and hidden ports', () => {
    const ports = parseChargingPorts('Port 1#1#x#1700000000|Port 2#-1#x#0');

    expect(ports).toEqual([
      expect.objectContaining({ name: 'Port 1', hidden: false, targetUnixSeconds: 1700000000 }),
      expect.objectContaining({ name: 'Port 2', hidden: true, targetUnixSeconds: 0 }),
    ]);
  });
});
