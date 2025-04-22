import type {
  ApiCore,
  CancelTopupInput,
  CheckCoinData,
  CheckCoinInput,
  JuanFiResult,
  TopupData,
  TopupInput,
} from './types';
import { postForm } from './internal/http';
import { parseObjectLike, readNumber, readString, toResult } from './internal/parse';

export async function startTopup(core: ApiCore, input: TopupInput): Promise<JuanFiResult<TopupData>> {
  const body: Record<string, string> = {
    voucher: input.voucher ?? '',
    mac: input.mac,
    extendTime: input.extendTime ? '1' : '0',
  };

  if (input.ipAddress !== undefined) body.ipAddress = input.ipAddress;
  if (input.topupType !== undefined) body.topupType = input.topupType;
  if (input.chargerPort !== undefined) body.chargerPort = String(input.chargerPort);

  const record = parseObjectLike(await postForm(core, '/topUp', body));
  return toResult(record, {
    voucher: readString(record, 'voucher') ?? input.voucher ?? '',
    raw: record,
  });
}

export async function cancelTopup(
  core: ApiCore,
  input: CancelTopupInput,
): Promise<JuanFiResult<Record<string, unknown>>> {
  const record = parseObjectLike(
    await postForm(core, '/cancelTopUp', {
      voucher: input.voucher,
      mac: input.mac,
    }),
  );
  return toResult(record, record);
}

export async function checkCoin(core: ApiCore, input: CheckCoinInput): Promise<JuanFiResult<CheckCoinData>> {
  const record = parseObjectLike(
    await postForm(core, '/checkCoin', {
      voucher: input.voucher,
    }),
  );

  const data: CheckCoinData = {
    voucher: readString(record, 'voucher'),
    totalCoin: readNumber(record, 'totalCoin'),
    newCoin: readNumber(record, 'newCoin'),
    timeAdded: readNumber(record, 'timeAdded'),
    data: readString(record, 'data'),
    validity: readString(record, 'validity'),
    remainTime: readNumber(record, 'remainTime'),
    waitTime: readNumber(record, 'waitTime'),
    raw: record,
  };

  return toResult(record, data);
}
