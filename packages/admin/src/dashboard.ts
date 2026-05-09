import { adminRoutes } from './routes';
import { getText, postForm } from './internal/http';
import { padFields, readFieldInt, readFieldString, splitPositional } from './internal/parse';
import type { AdminCore, JuanFiAdminResult } from './types';

export const DASHBOARD_FIELD_COUNT = 19;

/** column order from web_dashboard.cpp. golden fixture txt may be stale */
export const dashboardField = {
  uptimeMs: 0,
  lifetimeSales: 1,
  currentSales: 2,
  customerCount: 3,
  internetStatus: 4,
  routerConnected: 5,
  macAddress: 6,
  ipAddress: 7,
  deviceType: 8,
  compatibilityVersion: 9,
  interfaceType: 10,
  signalPercent: 11,
  freeHeap: 12,
  authType: 13,
  placeholder14: 14,
  activeUsers: 15,
  epochTimeOrEmpty: 16,
  placeholder17: 17,
  lanTypeOrEmpty: 18,
} as const;

export type DashboardSnapshot = {
  readonly uptimeMs: number;
  readonly lifetimeSales: number;
  readonly currentSales: number;
  readonly customerCount: number;
  readonly internetStatus: boolean;
  readonly routerConnected: boolean;
  /** empty if no iface yet */
  readonly macAddress: string;
  /** empty if no address */
  readonly ipAddress: string;
  /** ESP32 / ESP8266 string from firmware */
  readonly deviceType: string;
  /** legacy tag like v4.4. don't gate features on this alone */
  readonly compatibilityVersion: string;
  /** LAN or WIRELESS */
  readonly interfaceType: string;
  readonly signalPercent: number;
  readonly freeHeap: number;
  /** 1 admin 2 operator 0 none */
  readonly authType: number;
  readonly activeUsers: number;
  /** slot empty gives undefined. parseInt||undefined also drops 0 and NaN */
  readonly epochSeconds?: number;
  /** undefined if slot empty */
  readonly lanType?: string;
  /** keep raw row for debugging weird parses */
  readonly raw: string;
};

export function parseDashboard(raw: string): DashboardSnapshot {
  const fields = padFields(splitPositional(raw.trim()), DASHBOARD_FIELD_COUNT);
  const epochValue = readFieldString(fields, dashboardField.epochTimeOrEmpty);
  const lanTypeValue = readFieldString(fields, dashboardField.lanTypeOrEmpty);
  return {
    uptimeMs: readFieldInt(fields, dashboardField.uptimeMs),
    lifetimeSales: readFieldInt(fields, dashboardField.lifetimeSales),
    currentSales: readFieldInt(fields, dashboardField.currentSales),
    customerCount: readFieldInt(fields, dashboardField.customerCount),
    internetStatus: readFieldString(fields, dashboardField.internetStatus) === '1',
    routerConnected: readFieldString(fields, dashboardField.routerConnected) === '1',
    macAddress: readFieldString(fields, dashboardField.macAddress),
    ipAddress: readFieldString(fields, dashboardField.ipAddress),
    deviceType: readFieldString(fields, dashboardField.deviceType),
    compatibilityVersion: readFieldString(fields, dashboardField.compatibilityVersion),
    interfaceType: readFieldString(fields, dashboardField.interfaceType),
    signalPercent: readFieldInt(fields, dashboardField.signalPercent),
    freeHeap: readFieldInt(fields, dashboardField.freeHeap),
    authType: readFieldInt(fields, dashboardField.authType),
    activeUsers: readFieldInt(fields, dashboardField.activeUsers),
    epochSeconds: epochValue === '' ? undefined : Number.parseInt(epochValue, 10) || undefined,
    lanType: lanTypeValue === '' ? undefined : lanTypeValue,
    raw: raw,
  };
}

export async function fetchDashboard(core: AdminCore): Promise<DashboardSnapshot> {
  const raw = await getText(core, adminRoutes.dashboard);
  return parseDashboard(raw);
}

export type SalesDetail = {
  readonly dailySales: number;
  readonly monthlySales: number;
  readonly chargingSales: number;
  readonly raw: string;
};

/** getSalesDetail. daily|monthly|chargingSales, missing pieces read as 0 */
export async function fetchSalesDetail(core: AdminCore): Promise<SalesDetail> {
  const raw = await getText(core, adminRoutes.salesDetail);
  const parts = splitPositional(raw.trim());
  return {
    dailySales: Number.parseInt(parts[0] ?? '0', 10) || 0,
    monthlySales: Number.parseInt(parts[1] ?? '0', 10) || 0,
    chargingSales: Number.parseInt(parts[2] ?? '0', 10) || 0,
    raw: raw,
  };
}

/** resetStatistic form type=. firmware counters dailySales monthlySales ... */
export type ResetStatisticType =
  | 'dailySales'
  | 'monthlySales'
  | 'lifeTimeCount'
  | 'coinCount'
  | 'customerCount';

export async function resetStatistic(
  core: AdminCore,
  type: ResetStatisticType,
): Promise<JuanFiAdminResult<true>> {
  const raw = await postForm(core, adminRoutes.resetStatistic, { type });
  return raw.trim().toLowerCase().startsWith('ok')
    ? { ok: true, data: true }
    : { ok: false, code: raw.trim(), raw };
}
