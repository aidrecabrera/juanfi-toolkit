import { describe, expect, it } from 'vitest';
import { selectVendo } from './vendo';

const vendos = [
  {
    vendoName: 'Vendo 1',
    vendoIp: '10.1.0.41',
    hotspotAddress: '10.1.0.1',
    interfaceName: 'vlan11-hotspot1',
    chargingEnable: true,
    eloadEnable: false,
  },
  {
    vendoName: 'Vendo 2',
    vendoIp: '10.1.0.42',
    hotspotAddress: '10.1.0.2',
    interfaceName: 'vlan12-hotspot2',
    chargingEnable: false,
    eloadEnable: true,
  },
] as const;

describe('selectVendo', () => {
  it('manual selected vendo works', () => {
    const selected = selectVendo({
      isMultiVendo: true,
      multiVendoOption: 0,
      multiVendoAddresses: vendos,
      defaultVendoIp: '10.1.0.41',
      selectedVendoIp: '10.1.0.42',
    });

    expect(selected).toEqual(expect.objectContaining({ vendoIp: '10.1.0.42', showSelector: true }));
  });

  it('auto by hotspotAddress works', () => {
    const selected = selectVendo({
      isMultiVendo: true,
      multiVendoOption: 1,
      multiVendoAddresses: vendos,
      defaultVendoIp: '10.1.0.41',
      hotspotAddress: '10.1.0.2:80',
    });

    expect(selected.vendoIp).toBe('10.1.0.42');
  });

  it('auto by interfaceName works', () => {
    const selected = selectVendo({
      isMultiVendo: true,
      multiVendoOption: 2,
      multiVendoAddresses: vendos,
      defaultVendoIp: '10.1.0.41',
      interfaceName: 'vlan11-hotspot1',
    });

    expect(selected).toEqual(expect.objectContaining({ vendoIp: '10.1.0.41', chargingEnable: true, eloadEnable: false }));
  });
});
