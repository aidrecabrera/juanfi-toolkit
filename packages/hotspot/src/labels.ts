import type { JuanFiErrorCode } from './types';

export type JuanFiLabels = {
  readonly actions: {
    readonly insertCoin: string;
    readonly useVoucher: string;
    readonly pauseTime: string;
    readonly resumeTime: string;
    readonly cancel: string;
    readonly close: string;
    readonly connect: string;
    readonly promoRates: string;
    readonly charging: string;
    readonly eload: string;
  };
  readonly states: {
    readonly loading: string;
    readonly waitingForCoin: string;
    readonly checkingCoin: string;
    readonly coinAdded: string;
    readonly voucherReady: string;
    readonly timeExpired: string;
    readonly loggingInSoon: string;
  };
  readonly errors: Record<JuanFiErrorCode, string> & {
    readonly fallback: string;
  };
  readonly success: {
    readonly voucherSaved: string;
    readonly coinAccepted: string;
    readonly loginSoon: string;
    readonly loadSuccess: string;
  };
};

export function defineLabels<const T extends JuanFiLabels>(labels: T): T {
  return labels;
}

export const englishLabels = defineLabels({
  actions: {
    insertCoin: 'Insert Coin',
    useVoucher: 'Use Voucher',
    pauseTime: 'Pause Time',
    resumeTime: 'Resume Time',
    cancel: 'Cancel',
    close: 'Close',
    connect: 'Connect',
    promoRates: 'Promo Rates',
    charging: 'Charging',
    eload: 'E-Load',
  },
  states: {
    loading: 'Loading...',
    waitingForCoin: 'Waiting for coin...',
    checkingCoin: 'Checking coin...',
    coinAdded: 'Coin added',
    voucherReady: 'Voucher ready',
    timeExpired: 'Time expired',
    loggingInSoon: 'Logging in shortly',
  },
  errors: {
    'coins.wait.expired': 'Coin slot expired',
    'coin.not.inserted': 'Coin not inserted',
    'coinslot.cancelled': 'Coin slot was cancelled',
    'coinslot.busy': 'Coin slot is busy',
    'coin.slot.banned': 'Coin slot is blocked',
    'coin.slot.notavailable': 'Coin slot is not available',
    'no.internet.detected': 'No internet connection',
    'product.hash.invalid': 'Product was changed',
    'convertVoucher.empty': 'Enter voucher code',
    'convertVoucher.invalid': 'Invalid voucher code',
    'load.not.enough': 'Not enough load',
    'eload.failed': 'E-load failed',
    'coin.is.reading': 'Checking coin...',
    fallback: 'Something went wrong',
  },
  success: {
    voucherSaved: 'Voucher saved',
    coinAccepted: 'Coin accepted',
    loginSoon: 'Logging in shortly',
    loadSuccess: 'Load successful',
  },
});
