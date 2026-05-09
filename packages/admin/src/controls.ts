import { adminRoutes } from './routes';
import { getText, postEmpty, postForm } from './internal/http';
import type { AdminCore, JuanFiAdminResult } from './types';

function okResult(raw: string): JuanFiAdminResult<true> {
  return raw.trim().toLowerCase().startsWith('ok')
    ? { ok: true, data: true }
    : { ok: false, code: raw.trim() || 'unknown', raw };
}

export async function restartSystem(core: AdminCore): Promise<JuanFiAdminResult<true>> {
  return okResult(await postEmpty(core, adminRoutes.restartSystem));
}

export async function restartMikrotik(core: AdminCore): Promise<JuanFiAdminResult<true>> {
  return okResult(await postEmpty(core, adminRoutes.restartMikrotik));
}

/*
 * URL typo toggerNightLight is firmware. toggles nightLightPin, always ok even if LED dead
 */
export async function toggleNightLight(core: AdminCore): Promise<JuanFiAdminResult<true>> {
  return okResult(await postEmpty(core, adminRoutes.toggleNightLight));
}

/** SSID list passthrough from networkManager.scan_ssid_list */
export async function scanSsid(core: AdminCore): Promise<string> {
  return await getText(core, adminRoutes.scanSSID);
}

/*
 * stub handler, still authed. we always wrap as ok + trimmed text, no error channel yet
 */
export async function scanBuyersQr(core: AdminCore): Promise<JuanFiAdminResult<string>> {
  const raw = await postEmpty(core, adminRoutes.scanBuyersQr);
  return { ok: true, data: raw.trim() };
}

/*
 * testInsertCoin bench helper. firmware treats missing or 0 coin as 1
 */
export async function testInsertCoin(
  core: AdminCore,
  coin = 1,
): Promise<JuanFiAdminResult<true>> {
  const raw = await postForm(core, adminRoutes.testInsertCoin, { coin: String(coin) });
  return okResult(raw);
}
