import { adminRoutes } from './routes';
import { getText, postData, postEmpty, postUpload } from './internal/http';
import { splitPositional, splitRows } from './internal/parse';
import type { AdminCore, JuanFiAdminResult } from './types';

/** default pipe 0|0|| kDefaultEloadSetting: index0 enable 0|1, rest api/key/extra passthrough */
export type AdminEloadSettings = {
  readonly enabled: boolean;
  readonly apiFlag: string;
  readonly apiKey: string;
  readonly extra: string;
  readonly raw: string;
};

export function parseEloadSettings(raw: string): AdminEloadSettings {
  const parts = splitPositional(raw.trim());
  return {
    enabled: (parts[0] ?? '0') === '1',
    apiFlag: parts[1] ?? '',
    apiKey: parts[2] ?? '',
    extra: parts[3] ?? '',
    raw,
  };
}

export function serializeEloadSettings(s: AdminEloadSettings): string {
  return [s.enabled ? '1' : '0', s.apiFlag, s.apiKey, s.extra].join('|');
}

export async function fetchEloadSettings(core: AdminCore): Promise<AdminEloadSettings> {
  const raw = await getText(core, adminRoutes.eloadGetSetting);
  return parseEloadSettings(raw);
}

export async function saveEloadSettings(
  core: AdminCore,
  settings: AdminEloadSettings,
): Promise<JuanFiAdminResult<true>> {
  const raw = await postData(core, adminRoutes.eloadSaveSetting, serializeEloadSettings(settings));
  return raw.trim().toLowerCase().startsWith('ok')
    ? { ok: true, data: true }
    : { ok: false, code: raw.trim(), raw };
}

/**
 * gzip csv bytes as text when catalog exists
 * literal disabled isn't gzip. return eload.disabled so nobody feeds the decompressor
 */
export async function fetchEloadCatalog(core: AdminCore): Promise<
  JuanFiAdminResult<string>
> {
  const raw = await getText(core, adminRoutes.eloadGetRates);
  if (raw.trim().toLowerCase() === 'disabled') {
    return { ok: false, code: 'eload.disabled', raw };
  }
  return { ok: true, data: raw };
}

export async function uploadEloadCatalog(
  core: AdminCore,
  file: Blob,
): Promise<JuanFiAdminResult<true>> {
  const form = new FormData();
  form.append('file', file, 'eload.csv');
  const raw = await postUpload(core, adminRoutes.eloadUploadRates, form);
  return raw.trim().toLowerCase().startsWith('ok')
    ? { ok: true, data: true }
    : { ok: false, code: raw.trim(), raw };
}

/** splitRows on trx blob. often starts 0|0 then detail */
export type AdminEloadTransactions = {
  readonly raw: string;
  readonly rows: readonly string[];
};

export async function fetchEloadTransactions(
  core: AdminCore,
): Promise<AdminEloadTransactions> {
  const raw = await getText(core, adminRoutes.eloadGetTransactions);
  return { raw, rows: splitRows(raw) };
}

export async function resetEloadTransactions(core: AdminCore): Promise<JuanFiAdminResult<true>> {
  const raw = await postEmpty(core, adminRoutes.eloadResetTransactions);
  return raw.trim().toLowerCase().startsWith('ok')
    ? { ok: true, data: true }
    : { ok: false, code: raw.trim(), raw };
}

export async function checkEloadBalance(core: AdminCore): Promise<string> {
  return await getText(core, adminRoutes.eloadCheckBalance);
}
