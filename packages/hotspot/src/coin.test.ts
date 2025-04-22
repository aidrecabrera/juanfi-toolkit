import { describe, expect, it, vi } from 'vitest';
import { createCoinFlow } from './coin';

describe('coin flow', () => {
  it('coin.not.inserted emits waiting progress', async () => {
    const onWaitingForCoin = vi.fn();
    const flow = createCoinFlow({
      api: {
        startTopup: async () => ({ ok: true, data: { voucher: 'ABC123', raw: {} } }),
        checkCoin: async () => ({
          ok: false,
          code: 'coin.not.inserted',
          data: {
            totalCoin: 0,
            newCoin: 0,
            timeAdded: 0,
            remainTime: 30000,
            waitTime: 60000,
            raw: {},
          },
        }),
        cancelTopup: async () => ({ ok: true, data: {} }),
        useVoucher: async () => ({ ok: true, data: { raw: {} } }),
      },
      mac: 'AA:BB',
      onWaitingForCoin,
    });

    await flow.start();
    await flow.check();
    flow.stop();

    expect(onWaitingForCoin).toHaveBeenCalledWith(expect.objectContaining({ percent: 50 }));
  });

  it('coin inserted emits total coin and time', async () => {
    const onCoinAdded = vi.fn();
    const flow = createCoinFlow({
      api: {
        startTopup: async () => ({ ok: true, data: { voucher: 'ABC123', raw: {} } }),
        checkCoin: async () => ({
          ok: true,
          data: {
            voucher: 'ABC123',
            totalCoin: 5,
            newCoin: 1,
            timeAdded: 3600,
            raw: {},
          },
        }),
        cancelTopup: async () => ({ ok: true, data: {} }),
        useVoucher: async () => ({ ok: true, data: { raw: {} } }),
      },
      mac: 'AA:BB',
      onCoinAdded,
    });

    await flow.start();
    await flow.check();
    flow.stop();

    expect(onCoinAdded).toHaveBeenCalledWith(expect.objectContaining({ totalCoin: 5, timeAdded: 3600 }));
  });
});
