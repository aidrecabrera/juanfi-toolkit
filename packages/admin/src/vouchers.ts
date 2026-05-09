import { adminRoutes } from './routes';
import { getText, postForm } from './internal/http';
import { splitPositional } from './internal/parse';
import type { AdminCore, JuanFiAdminResult } from './types';

export type GenerateVouchersInput = {
  /** form amt */
  readonly amount: number;
  /** form qty. firmware clamps 1..15 */
  readonly quantity: number;
  /** form sales 1 counts toward stats store */
  readonly addToSales: boolean;
  /** form pfx */
  readonly prefix?: string;
};

/** success body vendo|amt|seconds|CODE#CODE#... fourth field is #-joined codes */
export type GenerateVouchersResult = {
  readonly vendoName: string;
  readonly amountPerVoucher: number;
  readonly secondsPerVoucher: number;
  readonly vouchers: readonly string[];
  readonly raw: string;
};

export function parseGenerateVouchersResult(raw: string): GenerateVouchersResult {
  const trimmed = raw.trim();
  const parts = splitPositional(trimmed);
  const codes = (parts[3] ?? '')
    .split('#')
    .map((code) => code.trim())
    .filter((code) => code.length > 0);
  return {
    vendoName: parts[0] ?? '',
    amountPerVoucher: Number.parseInt(parts[1] ?? '0', 10) || 0,
    secondsPerVoucher: Number.parseInt(parts[2] ?? '0', 10) || 0,
    vouchers: codes,
    raw: trimmed,
  };
}

export async function generateVouchers(
  core: AdminCore,
  input: GenerateVouchersInput,
): Promise<JuanFiAdminResult<GenerateVouchersResult>> {
  const raw = await postForm(core, adminRoutes.generateVouchers, {
    amt: String(input.amount),
    qty: String(input.quantity),
    sales: input.addToSales ? '1' : '0',
    pfx: input.prefix ?? '',
  });
  const trimmed = raw.trim();
  if (trimmed.toLowerCase() === 'busy') {
    return { ok: false, code: 'busy', raw };
  }
  const result = parseGenerateVouchersResult(trimmed);
  if (result.vouchers.length === 0) {
    return { ok: false, code: 'no-vouchers-generated', raw };
  }
  return { ok: true, data: result };
}

/** GET viewGeneratedVouchers. full voucher-generate.html with rows baked in for printing */
export async function fetchVoucherTemplate(core: AdminCore): Promise<string> {
  return await getText(core, adminRoutes.viewGeneratedVouchers);
}
