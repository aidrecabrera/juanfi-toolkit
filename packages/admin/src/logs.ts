import { adminRoutes } from './routes';
import { getText } from './internal/http';
import { splitRows } from './internal/parse';
import type { AdminCore } from './types';

/** one pipe chunk from Diagnostics::serializeLogs as-is */
export type AdminLogRow = {
  readonly raw: string;
};

export function parseSystemLogs(raw: string): readonly AdminLogRow[] {
  return splitRows(raw).map((row) => ({ raw: row }));
}

export async function fetchSystemLogs(core: AdminCore): Promise<readonly AdminLogRow[]> {
  const raw = await getText(core, adminRoutes.getSystemLogs);
  return parseSystemLogs(raw);
}
