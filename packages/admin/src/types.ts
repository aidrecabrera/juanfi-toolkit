import type { JuanFiAdminResult } from './errors';

export type { JuanFiAdminResult, JuanFiAdminError, JuanFiAdminErrorType } from './errors';

export type JuanFiAdminOptions = {
  /** firmware origin, prepends http:// if no scheme */
  readonly baseUrl: string;
  /** skip login by seeding core.state.token */
  readonly token?: string;
  /** default globalThis.fetch */
  readonly fetch?: typeof fetch;
  /** AbortController deadline per request, default 10s */
  readonly timeoutMs?: number;
};

/** dashboard auth_type maps to role string here */
export type AuthRole = 'admin' | 'operator' | 'none';

/** validateLogin body only. caller merges token into core */
export type LoginResult =
  | {
      readonly ok: true;
      /** goes out as X-TOKEN on authed routes */
      readonly token: string;
      readonly raw: string;
    }
  | {
      readonly ok: false;
      readonly message: string;
      readonly raw: string;
    };

export type LoginInput = {
  readonly username: string;
  readonly password: string;
  readonly randomToken?: string;
};

/** fetch + baseUrl + timeout + mutable token, threaded through http.ts */
export type AdminCore = {
  readonly baseUrl: string;
  readonly fetch: typeof fetch;
  readonly timeoutMs: number;
  readonly state: { token?: string };
};

import type { DashboardSnapshot, ResetStatisticType, SalesDetail } from './dashboard';
import type { SystemConfigFields } from './system-config';
import type {
  AdminChargingRate,
  AdminInternetRate,
  RateKind,
} from './rates';
import type { AdminChargerPort } from './charging';
import type { AdminActiveUser } from './active-users';
import type { AdminLogRow } from './logs';
import type { GenerateVouchersInput, GenerateVouchersResult } from './vouchers';
import type {
  AdminEloadSettings,
  AdminEloadTransactions,
} from './eload';

export type JuanFiAdmin = {
  readonly validateLogin: (input: LoginInput) => Promise<LoginResult>;
  readonly logout: () => Promise<JuanFiAdminResult<true>>;
  readonly setToken: (token: string | undefined) => void;
  readonly getToken: () => string | undefined;

  readonly fetchDashboard: () => Promise<DashboardSnapshot>;
  readonly fetchSalesDetail: () => Promise<SalesDetail>;
  readonly resetStatistic: (type: ResetStatisticType) => Promise<JuanFiAdminResult<true>>;

  readonly fetchSystemConfig: () => Promise<SystemConfigFields>;
  readonly saveSystemConfig: (fields: SystemConfigFields) => Promise<JuanFiAdminResult<true>>;

  readonly fetchInternetRates: () => Promise<readonly AdminInternetRate[]>;
  readonly fetchChargingRates: () => Promise<readonly AdminChargingRate[]>;
  readonly saveInternetRates: (
    rates: readonly AdminInternetRate[],
  ) => Promise<JuanFiAdminResult<true>>;
  readonly saveChargingRates: (
    rates: readonly AdminChargingRate[],
  ) => Promise<JuanFiAdminResult<true>>;

  readonly fetchChargerPorts: () => Promise<readonly AdminChargerPort[]>;
  readonly saveChargerPorts: (
    ports: readonly AdminChargerPort[],
  ) => Promise<JuanFiAdminResult<true>>;

  readonly fetchActiveUsers: () => Promise<readonly AdminActiveUser[]>;
  readonly kickActiveUser: (input: {
    userId: string;
    voucher?: string;
  }) => Promise<JuanFiAdminResult<true>>;

  readonly fetchSystemLogs: () => Promise<readonly AdminLogRow[]>;

  readonly restartSystem: () => Promise<JuanFiAdminResult<true>>;
  readonly restartMikrotik: () => Promise<JuanFiAdminResult<true>>;
  readonly toggleNightLight: () => Promise<JuanFiAdminResult<true>>;
  readonly scanSsid: () => Promise<string>;
  readonly scanBuyersQr: () => Promise<JuanFiAdminResult<string>>;
  readonly testInsertCoin: (coin?: number) => Promise<JuanFiAdminResult<true>>;

  readonly generateVouchers: (
    input: GenerateVouchersInput,
  ) => Promise<JuanFiAdminResult<GenerateVouchersResult>>;
  readonly fetchVoucherTemplate: () => Promise<string>;

  readonly fetchEloadSettings: () => Promise<AdminEloadSettings>;
  readonly saveEloadSettings: (
    settings: AdminEloadSettings,
  ) => Promise<JuanFiAdminResult<true>>;
  readonly fetchEloadCatalog: () => Promise<JuanFiAdminResult<string>>;
  readonly uploadEloadCatalog: (file: Blob) => Promise<JuanFiAdminResult<true>>;
  readonly fetchEloadTransactions: () => Promise<AdminEloadTransactions>;
  readonly resetEloadTransactions: () => Promise<JuanFiAdminResult<true>>;
  readonly checkEloadBalance: () => Promise<string>;

  readonly updateMainBin: (
    binary: Blob,
    filename?: string,
  ) => Promise<JuanFiAdminResult<true>>;
  readonly uploadVoucherTemplate: (
    html: Blob,
    filename?: string,
  ) => Promise<JuanFiAdminResult<true>>;

  readonly fetchRates: (
    kind: RateKind,
  ) => Promise<readonly AdminInternetRate[] | readonly AdminChargingRate[]>;
};
