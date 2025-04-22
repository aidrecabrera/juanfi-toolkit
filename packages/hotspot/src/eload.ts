import type { CheckCoinData, LoadProduct, LoadProductGroups } from './types';
import type { CoinFlowUpdate, LoadFlow, LoadFlowInput, LoadFlowState } from './types';
import { defaultStorage } from './storage';

export function createLoadFlow(input: LoadFlowInput): LoadFlow {
  const storage = input.storage ?? defaultStorage;
  const pollMs = input.pollMs ?? 1000;
  let step: 0 | 1 | 2 | 3 | 4 = 0;
  let products: LoadProductGroups = {};
  let mobile = '';
  let selectedGroup: string | undefined;
  let selectedProduct: LoadProduct | undefined;
  let voucher = '';
  let totalCoin = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  const state = (): LoadFlowState => ({
    step,
    products,
    mobile,
    selectedGroup,
    selectedProduct,
    voucher,
    totalCoin,
  });

  const emitStep = (): void => input.onStep?.(state());

  const stop = (): void => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  const startPolling = (): void => {
    if (timer !== null) return;
    timer = setInterval(() => {
      void checkCoin();
    }, pollMs);
  };

  const checkCoin = async (): Promise<void> => {
    try {
      const result = await input.api.checkCoin({ voucher });
      if (result.ok) {
        const update = updateFromCheck(voucher, result.data);
        totalCoin = update.totalCoin;
        input.onCoinAdded?.(update);
        if (selectedProduct && totalCoin >= selectedProduct.price) await processLoad();
        return;
      }

      const data = isCheckCoinData(result.data) ? result.data : undefined;
      const update: CoinFlowUpdate = data ? updateFromCheck(voucher, data) : emptyUpdate(voucher);
      totalCoin = update.totalCoin;

      if (result.code === 'coin.is.reading') return;

      if (result.code === 'coin.not.inserted') {
        if ((update.remainTime ?? 0) <= 0) {
          if (totalCoin > 0) await processLoad();
          else {
            stop();
            input.onFailed?.({ code: 'coins.wait.expired' });
          }
          return;
        }
        input.onWaitingForCoin?.(update);
        return;
      }

      if (result.code === 'coinslot.busy') {
        stop();
        if (totalCoin > 0) input.onVoucherReady?.(update);
        else input.onFailed?.({ code: 'coinslot.cancelled' });
        return;
      }

      stop();
      input.onFailed?.({ code: result.code, error: result.data });
    } catch (error) {
      stop();
      input.onFailed?.({ code: 'network', error });
    }
  };

  const processLoad = async (): Promise<void> => {
    stop();
    try {
      const result = await input.api.finishLoad({ voucher });
      const update = emptyUpdate(voucher, totalCoin);
      if (result.ok) {
        if (selectedProduct && totalCoin > selectedProduct.price) {
          storage.saveValue('activeVoucher', voucher);
          input.onVoucherReady?.(update);
        }
        input.onDone?.(update);
        return;
      }

      if (result.code === 'eload.failed') {
        storage.saveValue('activeVoucher', voucher);
        input.onVoucherReady?.(update);
        input.onFailed?.({ code: result.code, error: result.data });
        return;
      }

      input.onFailed?.({ code: result.code, error: result.data });
    } catch (error) {
      if (totalCoin > 0) input.onVoucherReady?.(emptyUpdate(voucher, totalCoin));
      input.onFailed?.({ code: 'network', error });
    }
  };

  return {
    async start() {
      step = 1;
      emitStep();
      const result = await input.api.getLoadProducts({ decompress: input.decompress });
      if (!result.ok) {
        input.onFailed?.({ code: result.code, error: result.data });
        return;
      }
      products = result.data;
      input.onProducts?.(products);
      emitStep();
    },
    async next() {
      if (step === 0) {
        step = 1;
        emitStep();
        return;
      }
      if (step === 1) {
        if (mobile === '') return;
        step = 2;
        emitStep();
        return;
      }
      if (step === 2) {
        if (!selectedProduct) return;
        step = 3;
        emitStep();
        return;
      }
      if (step === 3) {
        step = 4;
        emitStep();
        if (!selectedProduct) return;
        const trxNo = generateString(15);
        const result = await input.api.startLoad({
          mobile,
          amount: selectedProduct.price,
          mac: input.mac,
          hash: selectedProduct.hash,
          code: selectedProduct.code,
          trxNo,
          trxTime: Date.now(),
        });
        if (!result.ok) {
          input.onFailed?.({ code: result.code, error: result.data });
          return;
        }
        voucher = result.data.voucher;
        startPolling();
      }
    },
    prev() {
      if (step > 0) step = (step - 1) as 0 | 1 | 2 | 3;
      emitStep();
    },
    setMobile(nextMobile: string) {
      mobile = nextMobile;
      emitStep();
    },
    selectGroup(group: string) {
      selectedGroup = group;
      selectedProduct = products[group]?.[0];
      emitStep();
    },
    selectProduct(code: string) {
      if (!selectedGroup) return;
      selectedProduct = products[selectedGroup]?.find((product) => product.code === code);
      emitStep();
    },
    stop,
    getState: state,
  };
}

export function generateString(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function updateFromCheck(voucher: string, data: CheckCoinData): CoinFlowUpdate {
  const waitTime = data.waitTime ?? 0;
  const remainTime = data.remainTime ?? 0;
  return {
    voucher: data.voucher ?? voucher,
    totalCoin: data.totalCoin,
    newCoin: data.newCoin,
    timeAdded: data.timeAdded,
    data: data.data,
    validity: data.validity,
    remainTime,
    waitTime,
    percent: waitTime > 0 ? Math.trunc((remainTime / waitTime) * 100) : undefined,
    raw: data,
  };
}

function emptyUpdate(voucher: string, totalCoin = 0): CoinFlowUpdate {
  return {
    voucher,
    totalCoin,
    newCoin: 0,
    timeAdded: 0,
  };
}

function isCheckCoinData(value: unknown): value is CheckCoinData {
  return value !== null && typeof value === 'object' && 'totalCoin' in value;
}
