import type {
  ApiCore,
  ConvertVoucherInput,
  JuanFiResult,
  UseVoucherData,
  UseVoucherInput,
  VoucherFileData,
  VoucherFileInput,
} from './types';
import { getRelativeText, postForm } from './internal/http';
import { parseObjectLike, readString, toResult } from './internal/parse';

export async function useVoucher(core: ApiCore, input: UseVoucherInput): Promise<JuanFiResult<UseVoucherData>> {
  const record = parseObjectLike(
    await postForm(core, '/useVoucher', {
      voucher: input.voucher,
    }),
  );

  return toResult(record, {
    voucher: readString(record, 'voucher'),
    validity: readString(record, 'validity'),
    raw: record,
  });
}

export async function convertVoucher(
  core: ApiCore,
  input: ConvertVoucherInput,
): Promise<JuanFiResult<Record<string, unknown>>> {
  const record = parseObjectLike(
    await postForm(core, '/convertVoucher', {
      voucher: input.voucher,
      convertVoucher: input.convertVoucher,
    }),
  );

  return toResult(record, record);
}

export async function readVoucherFile(core: ApiCore, input: VoucherFileInput): Promise<VoucherFileData> {
  const macNoColon = input.mac.replaceAll(':', '');
  const basePath = input.basePath ?? '/data';
  const cacheBust = input.cacheBust ?? true;
  const query = cacheBust ? `?query=${Date.now()}` : '';
  const raw = await getRelativeText(core, `${basePath}/${macNoColon}.txt${query}`);
  return parseVoucherFile(raw);
}

export function parseVoucherFile(raw: string): VoucherFileData {
  const [voucher = '', validity = ''] = raw.split('#');
  return {
    voucher,
    validity,
    raw,
  };
}
