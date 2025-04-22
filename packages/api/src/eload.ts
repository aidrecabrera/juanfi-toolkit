import type {
  ApiCore,
  FinishLoadData,
  FinishLoadInput,
  GetLoadProductsInput,
  JuanFiResult,
  LoadProduct,
  LoadProductGroups,
  StartLoadData,
  StartLoadInput,
} from './types';
import { getArrayBuffer, postForm } from './internal/http';
import { parseObjectLike, readString, toResult } from './internal/parse';

export async function getLoadProducts(
  core: ApiCore,
  input: GetLoadProductsInput = {},
): Promise<JuanFiResult<LoadProductGroups>> {
  const raw = await getArrayBuffer(core, '/eload/rates', {
    date: String(Date.now()),
  });
  const text = input.decompress ? input.decompress(raw) : new TextDecoder().decode(raw);

  if (text.trim() === 'disabled') {
    return { ok: false, code: 'eload.disabled' };
  }

  return {
    ok: true,
    data: groupLoadProducts(parseLoadProducts(text)),
  };
}

export function parseLoadProducts(raw: string): readonly LoadProduct[] {
  return raw
    .split('\n')
    .map((row) => row.trim())
    .filter((row) => row.length > 0)
    .map((row) => {
      const columns = row.split(',').map((value) => value.trim());
      return {
        code: columns[0] ?? '',
        name: columns[1] ?? '',
        price: Number.parseFloat(columns[2] ?? '0') || 0,
        group: columns[3] ?? '',
        hash: columns[4] ?? '',
        columns,
      } satisfies LoadProduct;
    })
    .filter((product) => product.group.length > 0);
}

export function groupLoadProducts(products: readonly LoadProduct[]): LoadProductGroups {
  const groups: Record<string, LoadProduct[]> = {};
  for (const product of products) {
    const group = groups[product.group] ?? (groups[product.group] = []);
    group.push(product);
  }
  return groups;
}

export async function startLoad(core: ApiCore, input: StartLoadInput): Promise<JuanFiResult<StartLoadData>> {
  const record = parseObjectLike(
    await postForm(core, '/eload/topUp', {
      mobile: input.mobile,
      amt: String(input.amount),
      mac: input.mac,
      hash: input.hash,
      code: input.code,
      trxNo: input.trxNo,
      trxTime: String(input.trxTime),
    }),
  );

  return toResult(record, {
    voucher: readString(record, 'voucher') ?? '',
    raw: record,
  });
}

export async function finishLoad(core: ApiCore, input: FinishLoadInput): Promise<JuanFiResult<FinishLoadData>> {
  const record = parseObjectLike(
    await postForm(core, '/eload/process', {
      voucher: input.voucher,
    }),
  );

  return toResult(record, {
    voucher: readString(record, 'voucher'),
    raw: record,
  });
}
