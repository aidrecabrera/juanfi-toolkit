import { adminRoutes } from './routes';
import { postUpload } from './internal/http';
import type { AdminCore, JuanFiAdminResult } from './types';

/**
 * OTA main bin upload. maint_update.cpp stream handler
 * ok prefix on success. link can die during flash. transport errors are separate problem
 */
export async function updateMainBin(
  core: AdminCore,
  binary: Blob,
  filename = 'firmware.bin',
): Promise<JuanFiAdminResult<true>> {
  const form = new FormData();
  form.append('file', binary, filename);
  const raw = await postUpload(core, adminRoutes.updateMainBin, form);
  return raw.trim().toLowerCase().startsWith('ok')
    ? { ok: true, data: true }
    : { ok: false, code: raw.trim(), raw };
}

/** voucher html template upload. voucher-generate.html on SPIFFS */
export async function uploadVoucherTemplate(
  core: AdminCore,
  html: Blob,
  filename = 'voucher-generate.html',
): Promise<JuanFiAdminResult<true>> {
  const form = new FormData();
  form.append('file', html, filename);
  const raw = await postUpload(core, adminRoutes.uploadVoucherTemplate, form);
  return raw.trim().toLowerCase().startsWith('ok')
    ? { ok: true, data: true }
    : { ok: false, code: raw.trim(), raw };
}
