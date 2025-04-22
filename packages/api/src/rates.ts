import type { ApiCore, GetRatesInput, Rate, RateType } from './types';
import { getText } from './internal/http';
import { splitColumns, splitRows } from './internal/parse';

export async function getRates(core: ApiCore, input: GetRatesInput): Promise<readonly Rate[]> {
  const raw = await getText(core, '/getRates', {
    rateType: normalizeRateType(input.rateType),
    date: String(Date.now()),
  });
  return parseRates(raw);
}

export function parseRates(raw: string): readonly Rate[] {
  return splitRows(raw).map((row) => {
    const columns = splitColumns(row);
    return {
      rate: columns[0] ?? '',
      validityMinutes: Number.parseInt(columns[3] ?? '0', 10) || 0,
      dataMb: columns[4] === undefined || columns[4] === '' ? undefined : columns[4],
      columns,
    } satisfies Rate;
  });
}

function normalizeRateType(rateType: RateType): string {
  if (rateType === 'internet') return '1';
  if (rateType === 'charging') return '2';
  return String(rateType);
}
