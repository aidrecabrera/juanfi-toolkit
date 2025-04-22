import { getChargingPorts } from './charging';
import { cancelTopup, checkCoin, startTopup } from './coin';
import { finishLoad, getLoadProducts, startLoad } from './eload';
import { createCore } from './internal/http';
import { getRates } from './rates';
import type { JuanFiApi, JuanFiApiOptions } from './types';
import { convertVoucher, readVoucherFile, useVoucher } from './voucher';

export function createJuanFiApi(options: JuanFiApiOptions): JuanFiApi {
  const core = createCore(options);

  return {
    startTopup: (input) => startTopup(core, input),
    cancelTopup: (input) => cancelTopup(core, input),
    checkCoin: (input) => checkCoin(core, input),
    useVoucher: (input) => useVoucher(core, input),
    convertVoucher: (input) => convertVoucher(core, input),
    getRates: (input) => getRates(core, input),
    getChargingPorts: () => getChargingPorts(core),
    getLoadProducts: (input) => getLoadProducts(core, input),
    startLoad: (input) => startLoad(core, input),
    finishLoad: (input) => finishLoad(core, input),
    readVoucherFile: (input) => readVoucherFile(core, input),
  };
}
