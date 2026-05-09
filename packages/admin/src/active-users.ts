import { adminRoutes } from './routes';
import { getText, postForm } from './internal/http';
import { splitColumns, splitRows } from './internal/parse';
import type { AdminCore, JuanFiAdminResult } from './types';

/** id#voucher#mac#sessionLeft per web_admin_actions active users */
export type AdminActiveUser = {
  readonly id: string;
  readonly voucher: string;
  readonly mac: string;
  readonly sessionLeft: string;
  readonly columns: readonly string[];
};

export function parseActiveUsers(raw: string): readonly AdminActiveUser[] {
  return splitRows(raw).map((row) => {
    const columns = splitColumns(row);
    return {
      id: columns[0] ?? '',
      voucher: columns[1] ?? '',
      mac: columns[2] ?? '',
      sessionLeft: columns[3] ?? '',
      columns,
    } satisfies AdminActiveUser;
  });
}

export async function fetchActiveUsers(core: AdminCore): Promise<readonly AdminActiveUser[]> {
  const raw = await getText(core, adminRoutes.getActiveUsers);
  return parseActiveUsers(raw);
}

/*
 * kickActiveUser. userId + optional voucher in form body
 * if voucher is set firmware also deletes voucher on hotspot side
 */
export async function kickActiveUser(
  core: AdminCore,
  input: { userId: string; voucher?: string },
): Promise<JuanFiAdminResult<true>> {
  const raw = await postForm(core, adminRoutes.kickActiveUser, {
    userId: input.userId,
    voucher: input.voucher,
  });
  return raw.trim().toLowerCase().startsWith('ok')
    ? { ok: true, data: true }
    : { ok: false, code: raw.trim(), raw };
}
