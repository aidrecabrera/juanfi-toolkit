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
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly code: JuanFiErrorCode | string; readonly data?: unknown };

export type LoginOption = 0 | 1;

export type HotspotPageContext = {
  readonly mac?: string;
  readonly ip?: string;
  readonly chapId?: string;
  readonly chapChallenge?: string;
  readonly linkLoginOnly?: string;
  readonly linkLogout?: string;
  readonly linkOrig?: string;
  readonly serverAddress?: string;
  readonly interfaceName?: string;
  readonly username?: string;
};

export type Vendo = {
  readonly vendoName: string;
  readonly vendoIp: string;
  readonly chargingEnable?: boolean;
  readonly eloadEnable?: boolean;
  readonly hotspotAddress?: string;
  readonly interfaceName?: string;
};

export type MultiVendoOption = 0 | 1 | 2;

export type VendoInput = {
  readonly isMultiVendo: boolean;
  readonly multiVendoOption: MultiVendoOption;
  readonly multiVendoAddresses: readonly Vendo[];
  readonly defaultVendoIp: string;
  readonly selectedVendoIp?: string | null;
  readonly hotspotAddress?: string;
  readonly interfaceName?: string;
};

export type SelectedVendo = {
  readonly vendoIp: string;
  readonly vendo?: Vendo;
  readonly showSelector: boolean;
  readonly chargingEnable: boolean;
  readonly eloadEnable: boolean;
};

export type StoragePort = {
  readonly saveValue: (key: string, value: string) => void;
  readonly readValue: (key: string) => string | null;
  readonly removeValue: (key: string) => void;
};

export type Timer = {
  readonly start: () => void;
  readonly stop: () => void;
  readonly getRemaining: () => number;
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

export type UseVoucherData = {
  readonly validity?: string;
  readonly voucher?: string;
  readonly raw: Record<string, unknown>;
};

export type TopupData = {
  readonly voucher: string;
  readonly raw: Record<string, unknown>;
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

export type HotspotApi = {
  readonly startTopup: (input: {
    readonly voucher?: string;
    readonly mac: string;
    readonly ipAddress?: string;
    readonly extendTime?: boolean;
    readonly topupType?: string;
    readonly chargerPort?: number;
  }) => Promise<JuanFiResult<TopupData>>;
  readonly checkCoin: (input: { readonly voucher: string }) => Promise<JuanFiResult<CheckCoinData>>;
  readonly cancelTopup: (input: { readonly voucher: string; readonly mac: string }) => Promise<JuanFiResult<Record<string, unknown>>>;
  readonly useVoucher: (input: { readonly voucher: string }) => Promise<JuanFiResult<UseVoucherData>>;
  readonly getLoadProducts: (input?: { readonly decompress?: (raw: ArrayBuffer) => string }) => Promise<JuanFiResult<LoadProductGroups>>;
  readonly startLoad: (input: {
    readonly mobile: string;
    readonly amount: number | string;
    readonly mac: string;
    readonly hash: string;
    readonly code: string;
    readonly trxNo: string;
    readonly trxTime: number;
  }) => Promise<JuanFiResult<{ readonly voucher: string; readonly raw: Record<string, unknown> }>>;
  readonly finishLoad: (input: { readonly voucher: string }) => Promise<JuanFiResult<{ readonly voucher?: string; readonly raw: Record<string, unknown> }>>;
};

export type CoinFlowUpdate = {
  readonly voucher: string;
  readonly totalCoin: number;
  readonly newCoin: number;
  readonly timeAdded: number;
  readonly data?: string;
  readonly validity?: string;
  readonly remainTime?: number;
  readonly waitTime?: number;
  readonly percent?: number;
  readonly raw?: CheckCoinData;
};

export type CoinFlowError = {
  readonly code: JuanFiErrorCode | string;
  readonly error?: unknown;
};

export type CoinFlowInput = {
  readonly api: Pick<HotspotApi, 'startTopup' | 'checkCoin' | 'cancelTopup' | 'useVoucher'>;
  readonly mac: string;
  readonly voucher?: string;
  readonly ipAddress?: string;
  readonly extendTime?: boolean;
  readonly topupType?: 'CHARGER' | 'INTERNET' | 'ELOAD' | (string & {});
  readonly chargerPort?: number;
  readonly storage?: StoragePort;
  readonly pollMs?: number;
  readonly onStarted?: (update: CoinFlowUpdate) => void;
  readonly onWaitingForCoin?: (update: CoinFlowUpdate) => void;
  readonly onCheckingCoin?: (update: CoinFlowUpdate) => void;
  readonly onCoinAdded?: (update: CoinFlowUpdate) => void;
  readonly onVoucherReady?: (update: CoinFlowUpdate) => void;
  readonly onExpired?: (update: CoinFlowUpdate) => void;
  readonly onCancelled?: (update: CoinFlowUpdate) => void;
  readonly onFailed?: (error: CoinFlowError) => void;
  readonly onDone?: (update: CoinFlowUpdate) => void;
};

export type CoinFlow = {
  readonly start: () => Promise<void>;
  readonly check: () => Promise<void>;
  readonly save: () => Promise<void>;
  readonly cancel: () => Promise<void>;
  readonly stop: () => void;
  readonly getVoucher: () => string;
  readonly getTotalCoin: () => number;
};

export type LoadStep = 0 | 1 | 2 | 3 | 4;

export type LoadFlowState = {
  readonly step: LoadStep;
  readonly products: LoadProductGroups;
  readonly mobile: string;
  readonly selectedGroup?: string;
  readonly selectedProduct?: LoadProduct;
  readonly voucher: string;
  readonly totalCoin: number;
};

export type LoadFlowInput = {
  readonly api: Pick<HotspotApi, 'getLoadProducts' | 'startLoad' | 'checkCoin' | 'finishLoad'>;
  readonly mac: string;
  readonly storage?: StoragePort;
  readonly pollMs?: number;
  readonly decompress?: (raw: ArrayBuffer) => string;
  readonly onStep?: (state: LoadFlowState) => void;
  readonly onProducts?: (products: LoadProductGroups) => void;
  readonly onWaitingForCoin?: (update: CoinFlowUpdate) => void;
  readonly onCoinAdded?: (update: CoinFlowUpdate) => void;
  readonly onVoucherReady?: (update: CoinFlowUpdate) => void;
  readonly onFailed?: (error: CoinFlowError) => void;
  readonly onDone?: (update: CoinFlowUpdate) => void;
};

export type LoadFlow = {
  readonly start: () => Promise<void>;
  readonly next: () => Promise<void>;
  readonly prev: () => void;
  readonly setMobile: (mobile: string) => void;
  readonly selectGroup: (group: string) => void;
  readonly selectProduct: (code: string) => void;
  readonly stop: () => void;
  readonly getState: () => LoadFlowState;
};
