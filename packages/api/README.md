# @svene/juanfi-api

[![npm version](https://img.shields.io/npm/v/@svene/juanfi-api.svg)](https://www.npmjs.com/package/@svene/juanfi-api)
[![npm downloads](https://img.shields.io/npm/dm/@svene/juanfi-api.svg)](https://www.npmjs.com/package/@svene/juanfi-api)

Typed client for JuanFI vendo endpoints.

Use this when you need to call the vendo directly from a custom app, server script, test harness, or hotspot page code.

## install

```sh
npm install @svene/juanfi-api
```

## quickstart

```ts
import { createJuanFiApi } from '@svene/juanfi-api';

const api = createJuanFiApi({
  vendoIp: '10.1.0.41',
});

const result = await api.startTopup({
  voucher: '',
  mac: 'AA:BB:CC:DD:EE:FF',
  extendTime: false,
});

if (!result.ok) {
  console.log(result.code);
  return;
}

console.log(result.data.voucher);
```

## options

```ts
type JuanFiApiOptions = {
  readonly vendoIp: string;
  readonly fetch?: typeof fetch;
  readonly timeoutMs?: number;
};
```

`vendoIp` may include a protocol or omit it.

```ts
createJuanFiApi({ vendoIp: '10.1.0.41' });
createJuanFiApi({ vendoIp: 'http://10.1.0.41' });
```

`timeoutMs` defaults to `10000`.

Pass custom `fetch` for tests, proxies, logging, or runtimes without `globalThis.fetch`.

```ts
const api = createJuanFiApi({
  vendoIp: '10.1.0.41',
  timeoutMs: 5000,
  fetch: myFetch,
});
```

## result handling

JuanFI backend errors return values.

```ts
const result = await api.checkCoin({
  voucher: 'ABC123',
});

if (result.ok) {
  console.log(result.data.totalCoin);
} else {
  console.log(result.code);
  console.log(result.data);
}
```

Network, timeout, and parse failures throw.

## common calls

### start top-up

```ts
await api.startTopup({
  voucher: '',
  mac: 'AA:BB:CC:DD:EE:FF',
  ipAddress: '10.0.0.23',
  extendTime: false,
  topupType: 'INTERNET',
});
```

### check coin

```ts
const result = await api.checkCoin({
  voucher: 'ABC123',
});
```

### cancel top-up

```ts
await api.cancelTopup({
  voucher: 'ABC123',
  mac: 'AA:BB:CC:DD:EE:FF',
});
```

### use voucher

```ts
await api.useVoucher({
  voucher: 'ABC123',
});
```

### read rates

```ts
const rates = await api.getRates({
  rateType: 'internet',
});
```

Charging rates:

```ts
const rates = await api.getRates({
  rateType: 'charging',
});
```

### read charging ports

```ts
const ports = await api.getChargingPorts();
```

### read e-load products

```ts
const result = await api.getLoadProducts();

if (result.ok) {
  console.log(result.data);
}
```

With decompression:

```ts
const result = await api.getLoadProducts({
  decompress(raw) {
    return decompressRates(raw);
  },
});
```

### start and finish e-load

```ts
const start = await api.startLoad({
  mobile: '09171234567',
  amount: 50,
  mac: 'AA:BB:CC:DD:EE:FF',
  hash: selectedProduct.hash,
  code: selectedProduct.code,
  trxNo: 'abc123xyz456789',
  trxTime: Date.now(),
});

if (!start.ok) {
  console.log(start.code);
  return;
}

await api.finishLoad({
  voucher: start.data.voucher,
});
```

## known error codes

Known codes include:

* `coins.wait.expired`
* `coin.not.inserted`
* `coinslot.cancelled`
* `coinslot.busy`
* `coin.slot.banned`
* `coin.slot.notavailable`
* `no.internet.detected`
* `product.hash.invalid`
* `convertVoucher.empty`
* `convertVoucher.invalid`
* `load.not.enough`
* `eload.failed`
* `coin.is.reading`

Handle unknown codes too.

## parsing notes

JuanFI responses vary by endpoint and setup.

Current parsing:

* rates: `|` rows, `#` columns
* charging ports: `|` rows, `#` columns
* voucher files: `#`
* e-load products: line-based CSV-like rows
* JSON backend errors: preserved in `result.data`

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@svene/juanfi-api@0.1.1/dist/juanfi-api.min.js"></script>
```

Browser global:

```js
const api = JuanFiApi.createJuanFiApi({
  vendoIp: '10.1.0.41',
});
```

Download:

```sh
curl -L -o juanfi-api.js https://cdn.jsdelivr.net/npm/@svene/juanfi-api@0.1.1/dist/juanfi-api.min.js
```

Do not use `latest` in production. Always pin the version.

## scripts

```sh
npm run test -w @svene/juanfi-api
npm run build -w @svene/juanfi-api
```
