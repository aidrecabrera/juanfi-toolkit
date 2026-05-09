// @svene/juanfi-admin: typed client for JuanFi v4/v5 admin HTTP (paths + bodies follow ESP handlers, see routes.ts)

export const JUANFI_ADMIN_VERSION = '0.1.0';

export { createJuanFiAdmin } from './client';
export { parseLoginResponse } from './auth';

export { adminRoutes } from './routes';
export type { AdminRoute } from './routes';

export { JuanFiAdminError } from './errors';
export type { JuanFiAdminErrorType, JuanFiAdminResult } from './errors';

export type {
  JuanFiAdmin,
  JuanFiAdminOptions,
  AuthRole,
  LoginInput,
  LoginResult,
} from './types';

export {
  SYSTEM_CONFIG_FIELD_COUNT,
  SYSTEM_CONFIG_LEGACY_COUNT,
  configField,
  parseSystemConfig,
  serializeSystemConfig,
  mergeSystemConfig,
  readField,
  readFieldAsInt,
} from './system-config';
export type { ConfigFieldName, SystemConfigFields } from './system-config';

export {
  DASHBOARD_FIELD_COUNT,
  dashboardField,
  parseDashboard,
} from './dashboard';
export type {
  DashboardSnapshot,
  ResetStatisticType,
  SalesDetail,
} from './dashboard';

export {
  parseInternetRates,
  parseChargingRates,
  serializeInternetRates,
  serializeChargingRates,
} from './rates';
export type { AdminInternetRate, AdminChargingRate, RateKind } from './rates';

export { parseChargerPorts, serializeChargerPorts } from './charging';
export type { AdminChargerPort } from './charging';

export { parseActiveUsers } from './active-users';
export type { AdminActiveUser } from './active-users';
export { parseSystemLogs } from './logs';
export type { AdminLogRow } from './logs';

export { parseGenerateVouchersResult } from './vouchers';
export type { GenerateVouchersInput, GenerateVouchersResult } from './vouchers';

export { parseEloadSettings, serializeEloadSettings } from './eload';
export type { AdminEloadSettings, AdminEloadTransactions } from './eload';

/* parse helpers for fixtures/tests without an AdminCore. same code as live fetch paths */
export {
  splitRows,
  splitColumns,
  splitPositional,
  padFields,
  joinFields,
  readFieldInt,
  readFieldString,
  parseFormEncoded,
} from './internal/parse';
