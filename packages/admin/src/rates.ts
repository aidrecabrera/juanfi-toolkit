import { adminRoutes } from './routes';
import { getText, postData } from './internal/http';
import { splitColumns, splitRows } from './internal/parse';
import type { AdminCore, JuanFiAdminResult } from './types';

/** wire row name#price#minutes#validity#dataMb#profile */
export type AdminInternetRate = {
  readonly name: string;
  readonly price: number;
  readonly minutes: number;
  readonly validityMinutes: number;
  readonly dataMb: string;
  readonly profile: string;
  readonly columns: readonly string[];
};

/** name#price#minutes. extra # tails stay in columns */
export type AdminChargingRate = {
  readonly name: string;
  readonly price: number;
  readonly minutes: number;
  readonly columns: readonly string[];
};

export type RateKind = 'internet' | 'charging';

function rateTypeParam(kind: RateKind): string {
  return kind === 'internet' ? '1' : '2';
}

export function parseInternetRates(raw: string): readonly AdminInternetRate[] {
  return splitRows(raw).map((row) => {
    const columns = splitColumns(row);
    return {
      name: columns[0] ?? '',
      price: Number.parseInt(columns[1] ?? '0', 10) || 0,
      minutes: Number.parseInt(columns[2] ?? '0', 10) || 0,
      validityMinutes: Number.parseInt(columns[3] ?? '0', 10) || 0,
      dataMb: columns[4] ?? '',
      profile: columns[5] ?? '',
      columns,
    } satisfies AdminInternetRate;
  });
}

export function parseChargingRates(raw: string): readonly AdminChargingRate[] {
  return splitRows(raw).map((row) => {
    const columns = splitColumns(row);
    return {
      name: columns[0] ?? '',
      price: Number.parseInt(columns[1] ?? '0', 10) || 0,
      minutes: Number.parseInt(columns[2] ?? '0', 10) || 0,
      columns,
    } satisfies AdminChargingRate;
  });
}

export function serializeInternetRates(rates: readonly AdminInternetRate[]): string {
  return rates
    .map((rate) =>
      [
        rate.name,
        String(rate.price),
        String(rate.minutes),
        String(rate.validityMinutes),
        rate.dataMb,
        rate.profile,
      ].join('#'),
    )
    .join('|');
}

export function serializeChargingRates(rates: readonly AdminChargingRate[]): string {
  return rates
    .map((rate) => [rate.name, String(rate.price), String(rate.minutes)].join('#'))
    .join('|');
}

// TRANSPORT

export async function fetchRates(
  core: AdminCore,
  kind: RateKind,
): Promise<readonly AdminInternetRate[] | readonly AdminChargingRate[]> {
  const raw = await getText(core, adminRoutes.getRates, { rateType: rateTypeParam(kind) });
  return kind === 'internet' ? parseInternetRates(raw) : parseChargingRates(raw);
}

export async function fetchInternetRates(core: AdminCore): Promise<readonly AdminInternetRate[]> {
  const raw = await getText(core, adminRoutes.getRates, { rateType: rateTypeParam('internet') });
  return parseInternetRates(raw);
}

export async function fetchChargingRates(core: AdminCore): Promise<readonly AdminChargingRate[]> {
  const raw = await getText(core, adminRoutes.getRates, { rateType: rateTypeParam('charging') });
  return parseChargingRates(raw);
}

export async function saveInternetRates(
  core: AdminCore,
  rates: readonly AdminInternetRate[],
): Promise<JuanFiAdminResult<true>> {
  const raw = await postData(core, adminRoutes.saveRates, serializeInternetRates(rates), {
    rateType: rateTypeParam('internet'),
  });
  return raw.trim().toLowerCase().startsWith('ok')
    ? { ok: true, data: true }
    : { ok: false, code: raw.trim(), raw };
}

export async function saveChargingRates(
  core: AdminCore,
  rates: readonly AdminChargingRate[],
): Promise<JuanFiAdminResult<true>> {
  const raw = await postData(core, adminRoutes.saveRates, serializeChargingRates(rates), {
    rateType: rateTypeParam('charging'),
  });
  return raw.trim().toLowerCase().startsWith('ok')
    ? { ok: true, data: true }
    : { ok: false, code: raw.trim(), raw };
}
