import { adminRoutes } from './routes';
import { getText, postData } from './internal/http';
import { splitColumns, splitRows } from './internal/parse';
import type { AdminCore, JuanFiAdminResult } from './types';

/** example Port 1#-1#1#0#0 means name pin trigger offEpoch sales */
export type AdminChargerPort = {
  readonly name: string;
  readonly pin: number;
  /** 0 ActiveLow 1 ActiveHigh */
  readonly trigger: number;
  /** relay off time unix sec, 0 idle */
  readonly offTimeEpoch: number;
  readonly sales: number;
  readonly columns: readonly string[];
};

export function parseChargerPorts(raw: string): readonly AdminChargerPort[] {
  return splitRows(raw).map((row) => {
    const columns = splitColumns(row);
    return {
      name: columns[0] ?? '',
      pin: Number.parseInt(columns[1] ?? '-1', 10) || -1,
      trigger: Number.parseInt(columns[2] ?? '1', 10) || 0,
      offTimeEpoch: Number.parseInt(columns[3] ?? '0', 10) || 0,
      sales: Number.parseInt(columns[4] ?? '0', 10) || 0,
      columns,
    } satisfies AdminChargerPort;
  });
}

export function serializeChargerPorts(ports: readonly AdminChargerPort[]): string {
  return ports
    .map((port) =>
      [
        port.name,
        String(port.pin),
        String(port.trigger),
        String(port.offTimeEpoch),
        String(port.sales),
      ].join('#'),
    )
    .join('|');
}

export async function fetchChargerPorts(core: AdminCore): Promise<readonly AdminChargerPort[]> {
  const raw = await getText(core, adminRoutes.getChargerSettings);
  return parseChargerPorts(raw);
}

export async function saveChargerPorts(
  core: AdminCore,
  ports: readonly AdminChargerPort[],
): Promise<JuanFiAdminResult<true>> {
  const raw = await postData(core, adminRoutes.saveChargerSetting, serializeChargerPorts(ports));
  return raw.trim().toLowerCase().startsWith('ok')
    ? { ok: true, data: true }
    : { ok: false, code: raw.trim(), raw };
}
