import { adminRoutes } from './routes';
import { getText, postData } from './internal/http';
import { joinFields, padFields, splitPositional } from './internal/parse';
import type { AdminCore, JuanFiAdminResult } from './types';

/** v5 system.data field count */
export const SYSTEM_CONFIG_FIELD_COUNT = 65;
/** firmware rejects saves shorter than this (4.x). pad to full width anyway */
export const SYSTEM_CONFIG_LEGACY_COUNT = 30;

/** index map follows firmware/include/facts.hpp fi::config_field. unused slots still round-trip */
export const configField = {
  vendoName: 0,
  wifiSsid: 1,
  wifiPassword: 2,
  mikrotikIp: 3,
  routerUser: 4,
  routerPassword: 5,
  coinWaitSeconds: 6,
  adminUser: 7,
  adminPassword: 8,
  coinAbuseCount: 9,
  coinBanMinutes: 10,
  coinPin: 11,
  coinSetPin: 12,
  systemReadyLedPin: 13,
  insertCoinLedPin: 14,
  lcdCompatibility: 15,
  buttonPin: 16,
  checkInternet: 17,
  voucherPrefix: 18,
  marqueeText: 19,
  setupDoneFlag: 20,
  voucherPasswordEqualsUser: 21,
  voucherProfile: 22,
  voucherValidityMode: 23,
  ledTriggerType: 24,
  staticIpEnabled: 25,
  staticLocalIp: 26,
  staticGateway: 27,
  staticSubnet: 28,
  staticDns: 29,
  coinSlotMode: 30,
  singleCoinPulseCount: 31,
  routerConnectionMode: 32,
  operatorUser: 33,
  operatorPassword: 34,
  apiKey: 35,
  nightLightPin: 36,
  buttonFunction: 37,
  voucherLength: 38,
  coinMultiplier: 39,
  reserved40: 40,
  reserved41: 41,
  reserved42: 42,
  billAcceptorPin: 43,
  billAcceptorMultiplier: 44,
  printerCompatibility: 45,
  reserved46: 46,
  reserved47: 47,
  lanCsPin: 48,
  persistLogs: 49,
  reserved50: 50,
  reserved51: 51,
  reserved52: 52,
  reserved53: 53,
  reserved54: 54,
  restartScheduleMinutes: 55,
  blackoutDetection: 56,
  buzzerPin: 57,
  printerBaudRate: 58,
  pulseToBlock: 59,
  thankYouTimeoutSeconds: 60,
  ethBootUpPin: 61,
  ethPowerPin: 62,
  ethMdcPin: 63,
  ethMdioPin: 64,
} as const;

export type ConfigFieldName = keyof typeof configField;

/** all strings on the wire. no int coercion here, callers parse when needed */
export type SystemConfigFields = Record<ConfigFieldName, string>;

/** pad to 65 then map through configField. missing tail same as firmware empty */
export function parseSystemConfig(raw: string): SystemConfigFields {
  const fields = padFields(splitPositional(raw), SYSTEM_CONFIG_FIELD_COUNT);
  const out = {} as SystemConfigFields;
  for (const [name, index] of Object.entries(configField) as [ConfigFieldName, number][]) {
    out[name] = fields[index] ?? '';
  }
  return out;
}

/** always 65 slots so legacy length check passes and reserved indices don't drift */
export function serializeSystemConfig(fields: SystemConfigFields): string {
  const out = new Array<string>(SYSTEM_CONFIG_FIELD_COUNT).fill('');
  for (const [name, index] of Object.entries(configField) as [ConfigFieldName, number][]) {
    out[index] = fields[name] ?? '';
  }
  return joinFields(out);
}

/** shallow merge. keeps tail fields when UI only touched legacy prefix (slots 0..29) */
export function mergeSystemConfig(
  current: SystemConfigFields,
  partial: Partial<SystemConfigFields>,
): SystemConfigFields {
  return { ...current, ...partial };
}

export function readField(fields: SystemConfigFields, name: ConfigFieldName): string {
  return fields[name] ?? '';
}

export function readFieldAsInt(
  fields: SystemConfigFields,
  name: ConfigFieldName,
  fallback = 0,
): number {
  const value = fields[name];
  if (value === undefined || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** GET getSystemConfig. one line field0|...|field64, parser pads short reads */
export async function fetchSystemConfig(core: AdminCore): Promise<SystemConfigFields> {
  const raw = await getText(core, adminRoutes.getSystemConfig);
  return parseSystemConfig(raw.trim());
}

/**
 * POST saveSystemConfig, body data=<pipe string url-encoded>
 * firmware needs at least SYSTEM_CONFIG_LEGACY_COUNT fields. always emit all 65
 */
export async function saveSystemConfig(
  core: AdminCore,
  fields: SystemConfigFields,
): Promise<JuanFiAdminResult<true>> {
  const payload = serializeSystemConfig(fields);
  const raw = await postData(core, adminRoutes.saveSystemConfig, payload);
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.startsWith('ok')) return { ok: true, data: true };
  return { ok: false, code: trimmed || 'unknown', raw };
}
