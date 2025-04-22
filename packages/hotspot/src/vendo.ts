import type { SelectedVendo, Vendo, VendoInput } from './types';

export function selectVendo(input: VendoInput): SelectedVendo {
  if (!input.isMultiVendo) {
    return {
      vendoIp: input.defaultVendoIp,
      showSelector: false,
      chargingEnable: true,
      eloadEnable: true,
    };
  }

  if (input.multiVendoOption === 1) {
    const currentHotspot = (input.hotspotAddress ?? '').split(':')[0] ?? '';
    const vendo = input.multiVendoAddresses.find((item) => item.hotspotAddress === currentHotspot);
    return selected(vendo, input.defaultVendoIp, false);
  }

  if (input.multiVendoOption === 2) {
    const vendo = input.multiVendoAddresses.find((item) => item.interfaceName === input.interfaceName);
    return selected(vendo, input.defaultVendoIp, false);
  }

  const vendoIp = input.selectedVendoIp ?? input.defaultVendoIp;
  const vendo = input.multiVendoAddresses.find((item) => item.vendoIp === vendoIp);
  return selected(vendo, vendoIp, true);
}

export function canUseCharging(vendo: Vendo | undefined, fallback: boolean): boolean {
  return vendo?.chargingEnable ?? fallback;
}

export function canUseEload(vendo: Vendo | undefined, fallback: boolean): boolean {
  return vendo?.eloadEnable ?? fallback;
}

function selected(vendo: Vendo | undefined, fallbackIp: string, showSelector: boolean): SelectedVendo {
  return {
    vendoIp: vendo?.vendoIp ?? fallbackIp,
    vendo,
    showSelector,
    chargingEnable: vendo?.chargingEnable ?? true,
    eloadEnable: vendo?.eloadEnable ?? true,
  };
}
