export type JuanFiErrorCode =
  | 'coins.wait.expired'
  | 'coin.not.inserted'
  | 'coinslot.cancelled'
  | 'coinslot.busy'
  | 'coin.slot.banned'
  | 'coin.slot.notavailable'
  | 'no.internet.detected'
  | 'product.hash.invalid'
  | 'convertVoucher.empty'
  | 'convertVoucher.invalid'
  | 'load.not.enough'
  | 'eload.failed'
  | 'coin.is.reading';

export type JuanFiResult<T> =
  | {
      readonly ok: true;
      readonly data: T;
    }
  | {
      readonly ok: false;
      readonly code: JuanFiErrorCode | string;
      readonly data?: unknown;
    };

export type JuanFiApiErrorType = 'network' | 'timeout' | 'parse';

export class JuanFiApiError extends Error {
  readonly type: JuanFiApiErrorType;
  readonly raw?: string;

  constructor(input: { type: JuanFiApiErrorType; message: string; raw?: string }) {
    super(input.message);
    this.name = 'JuanFiApiError';
    this.type = input.type;
    this.raw = input.raw;
  }
}

export type JuanFiApiOptions = {
  readonly vendoIp: string;
  readonly fetch?: typeof fetch;
  readonly timeoutMs?: number;
};

export type RateType = 'internet' | 'charging' | '1' | '2' | (string & {});

export type TopupInput = {
  readonly voucher?: string;
  readonly mac: string;
  readonly ipAddress?: string;
  readonly extendTime?: boolean;
  readonly topupType?: 'CHARGER' | 'INTERNET' | 'ELOAD' | (string & {});
  readonly chargerPort?: number;
};

export type TopupData = {
  readonly voucher: string;
  readonly raw: Record<string, unknown>;
};

export type CancelTopupInput = {
  readonly voucher: string;
  readonly mac: string;
};

export type CheckCoinInput = {
  readonly voucher: string;
};

export type CheckCoinData = {
  readonly voucher?: string;
  readonly totalCoin: number;
  readonly newCoin: number;
  readonly timeAdded: number;
  readonly data?: string;
  readonly validity?: string;
  readonly remainTime?: number;
  readonly waitTime?: number;
  readonly raw: Record<string, unknown>;
};

export type UseVoucherInput = {
  readonly voucher: string;
};

export type UseVoucherData = {
  readonly validity?: string;
  readonly voucher?: string;
  readonly raw: Record<string, unknown>;
};

export type ConvertVoucherInput = {
  readonly voucher: string;
  readonly convertVoucher: string;
};

export type Rate = {
  readonly rate: string;
  readonly validityMinutes: number;
  readonly dataMb?: string;
  readonly columns: readonly string[];
};

export type GetRatesInput = {
  readonly rateType: RateType;
};

export type ChargingPort = {
  readonly index: number;
  readonly name: string;
  readonly pinSetting: string;
  readonly targetUnixSeconds: number;
  readonly hidden: boolean;
  readonly columns: readonly string[];
};

export type VoucherFileInput = {
  readonly mac: string;
  readonly basePath?: string;
  readonly cacheBust?: boolean;
};

export type VoucherFileData = {
  readonly voucher: string;
  readonly validity: string;
  readonly raw: string;
};

export type LoadProduct = {
  readonly code: string;
  readonly name: string;
  readonly price: number;
  readonly group: string;
  readonly hash: string;
  readonly columns: readonly string[];
};

export type LoadProductGroups = Readonly<Record<string, readonly LoadProduct[]>>;

export type GetLoadProductsInput = {
  readonly decompress?: (raw: ArrayBuffer) => string;
};

export type StartLoadInput = {
  readonly mobile: string;
  readonly amount: number | string;
  readonly mac: string;
  readonly hash: string;
  readonly code: string;
  readonly trxNo: string;
  readonly trxTime: number;
};

export type StartLoadData = {
  readonly voucher: string;
  readonly raw: Record<string, unknown>;
};

export type FinishLoadInput = {
  readonly voucher: string;
};

export type FinishLoadData = {
  readonly voucher?: string;
  readonly raw: Record<string, unknown>;
};

export type JuanFiApi = {
  readonly startTopup: (input: TopupInput) => Promise<JuanFiResult<TopupData>>;
  readonly cancelTopup: (input: CancelTopupInput) => Promise<JuanFiResult<Record<string, unknown>>>;
  readonly checkCoin: (input: CheckCoinInput) => Promise<JuanFiResult<CheckCoinData>>;
  readonly useVoucher: (input: UseVoucherInput) => Promise<JuanFiResult<UseVoucherData>>;
  readonly convertVoucher: (input: ConvertVoucherInput) => Promise<JuanFiResult<Record<string, unknown>>>;
  readonly getRates: (input: GetRatesInput) => Promise<readonly Rate[]>;
  readonly getChargingPorts: () => Promise<readonly ChargingPort[]>;
  readonly getLoadProducts: (input?: GetLoadProductsInput) => Promise<JuanFiResult<LoadProductGroups>>;
  readonly startLoad: (input: StartLoadInput) => Promise<JuanFiResult<StartLoadData>>;
  readonly finishLoad: (input: FinishLoadInput) => Promise<JuanFiResult<FinishLoadData>>;
  readonly readVoucherFile: (input: VoucherFileInput) => Promise<VoucherFileData>;
};

export type ApiCore = {
  readonly baseUrl: string;
  readonly fetch: typeof fetch;
  readonly timeoutMs: number;
};
