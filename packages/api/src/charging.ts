import type { ApiCore, ChargingPort } from './types';
import { getText } from './internal/http';
import { splitColumns, splitRows } from './internal/parse';

export async function getChargingPorts(core: ApiCore): Promise<readonly ChargingPort[]> {
  const raw = await getText(core, '/getChargingStation', {
    date: String(Date.now()),
  });
  return parseChargingPorts(raw);
}

export function parseChargingPorts(raw: string): readonly ChargingPort[] {
  return splitRows(raw).map((row, index) => {
    const columns = splitColumns(row);
    const pinSetting = columns[1] ?? '';
    return {
      index,
      name: columns[0] ?? '',
      pinSetting,
      targetUnixSeconds: Number.parseInt(columns[3] ?? '0', 10) || 0,
      hidden: pinSetting === '-1',
      columns,
    } satisfies ChargingPort;
  });
}
