import type { CheckCoinData, JuanFiResult, UseVoucherData } from './types';
import type { CoinFlow, CoinFlowInput, CoinFlowUpdate, StoragePort } from './types';
import { defaultStorage } from './storage';

const EMPTY_UPDATE: CoinFlowUpdate = {
  voucher: '',
  totalCoin: 0,
  newCoin: 0,
  timeAdded: 0,
};

export function createCoinFlow(input: CoinFlowInput): CoinFlow {
  const storage = input.storage ?? defaultStorage;
  const pollMs = input.pollMs ?? 1000;
  let voucher = input.voucher ?? '';
  let totalCoin = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  const stop = (): void => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  const startPolling = (): void => {
    if (timer !== null) return;
    timer = setInterval(() => {
      void check();
    }, pollMs);
  };

  const check = async (): Promise<void> => {
    try {
      const result = await input.api.checkCoin({ voucher });
      handleCheckResult(result, storage, input, voucher, stop, (nextTotal) => {
        totalCoin = nextTotal;
      });
    } catch (error) {
      stop();
      input.onFailed?.({ code: 'network', error });
    }
  };

  return {
    async start() {
      try {
        const result = await input.api.startTopup({
          voucher,
          mac: input.mac,
          ipAddress: input.ipAddress,
          extendTime: input.extendTime,
          topupType: input.topupType,
          chargerPort: input.chargerPort,
        });

        if (!result.ok) {
          input.onFailed?.({ code: result.code, error: result.data });
          return;
        }

        voucher = result.data.voucher;
        const update = { ...EMPTY_UPDATE, voucher };
        input.onStarted?.(update);
        startPolling();
      } catch (error) {
        input.onFailed?.({ code: 'network', error });
      }
    },
    check,
    async save() {
      try {
        const result = await input.api.useVoucher({ voucher });
        if (!result.ok) {
          input.onFailed?.({ code: result.code, error: result.data });
          return;
        }
        stop();
        storage.saveValue('activeVoucher', voucher);
        storage.removeValue('totalCoinReceived');
        const update = dataToUpdate(voucher, {
          ok: true,
          data: {
            voucher: result.data.voucher,
            validity: result.data.validity,
            raw: result.data.raw,
          },
        });
        input.onDone?.(update);
      } catch (error) {
        input.onFailed?.({ code: 'network', error });
      }
    },
    async cancel() {
      stop();
      if (totalCoin === 0 && voucher !== '') {
        await input.api.cancelTopup({ voucher, mac: input.mac });
      }
      input.onCancelled?.({ ...EMPTY_UPDATE, voucher, totalCoin });
    },
    stop,
    getVoucher() {
      return voucher;
    },
    getTotalCoin() {
      return totalCoin;
    },
  };
}

function handleCheckResult(
  result: JuanFiResult<CheckCoinData>,
  storage: StoragePort,
  input: CoinFlowInput,
  voucher: string,
  stop: () => void,
  setTotalCoin: (value: number) => void,
): void {
  if (result.ok) {
    const update = dataToUpdate(voucher, result);
    setTotalCoin(update.totalCoin);
    saveCoinState(storage, update);
    input.onCoinAdded?.(update);
    input.onVoucherReady?.(update);
    return;
  }

  const data = isCheckCoinData(result.data) ? result.data : undefined;
  const update = data ? dataToUpdate(voucher, { ok: true, data }) : { ...EMPTY_UPDATE, voucher };
  setTotalCoin(update.totalCoin);

  if (result.code === 'coin.is.reading') {
    input.onCheckingCoin?.(update);
    return;
  }

  if (result.code === 'coin.not.inserted') {
    if (update.validity) storage.saveValue(`${voucher}tempValidity`, update.validity);
    if ((update.remainTime ?? 0) <= 0) {
      stop();
      if (update.totalCoin > 0) {
        input.onVoucherReady?.(update);
        input.onDone?.(update);
      } else {
        input.onExpired?.(update);
      }
      return;
    }
    input.onWaitingForCoin?.(update);
    return;
  }

  if (result.code === 'coinslot.busy') {
    stop();
    if (update.totalCoin === 0) input.onCancelled?.(update);
    else input.onDone?.(update);
    return;
  }

  stop();
  input.onFailed?.({ code: result.code, error: result.data });
}

function dataToUpdate(voucher: string, result: JuanFiResult<CheckCoinData | UseVoucherData>): CoinFlowUpdate {
  if (!result.ok) return { ...EMPTY_UPDATE, voucher };
  const data = result.data;
  if ('totalCoin' in data) {
    const waitTime = data.waitTime ?? 0;
    const remainTime = data.remainTime ?? 0;
    const percent = waitTime > 0 ? Math.trunc((remainTime / waitTime) * 100) : undefined;
    return {
      voucher: data.voucher ?? voucher,
      totalCoin: data.totalCoin,
      newCoin: data.newCoin,
      timeAdded: data.timeAdded,
      data: data.data,
      validity: data.validity,
      remainTime,
      waitTime,
      percent,
      raw: data,
    };
  }
  return {
    ...EMPTY_UPDATE,
    voucher: data.voucher ?? voucher,
    validity: data.validity,
  };
}

function saveCoinState(storage: StoragePort, update: CoinFlowUpdate): void {
  storage.saveValue('activeVoucher', update.voucher);
  storage.saveValue('totalCoinReceived', String(update.totalCoin));
  if (update.validity) storage.saveValue(`${update.voucher}tempValidity`, update.validity);
}

function isCheckCoinData(value: unknown): value is CheckCoinData {
  return value !== null && typeof value === 'object' && 'totalCoin' in value;
}
