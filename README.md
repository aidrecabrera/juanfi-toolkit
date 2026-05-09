# juanfi-toolkit

TypeScript helpers for JuanFI hotspot pages and vendo integrations.

Use this when customizing a JuanFI Piso WiFi setup and you want typed wrappers instead of loose `fetch()` calls and copied page scripts.

## packages

- `@juanfi/api`: calls JuanFI vendo endpoints
- `@juanfi/hotspot`: handles browser-side hotspot flows

## install

```sh
npm install
```

## scripts

```sh
npm test
npm run typecheck
```

Build packages:

```sh
npm run build -w @juanfi/api
npm run build -w @juanfi/hotspot
```

## package overview

### `@juanfi/api`

Low-level client for vendo calls:

- start top-up
- cancel top-up
- check coin
- use voucher
- convert voucher
- read rates
- read charging ports
- read e-load products
- start and finish e-load
- read voucher files

### `@juanfi/hotspot`

Browser-side helpers for hotspot pages:

- voucher login
- member login
- CHAP password handling
- coin flow
- e-load flow
- selected vendo handling
- storage
- timers
- labels
- legacy helpers

## quick example

```ts
import { createJuanFiApi } from '@juanfi/api';

const api = createJuanFiApi({
  vendoIp: '10.1.0.41',
});

const result = await api.checkCoin({
  voucher: 'ABC123',
});

if (result.ok) {
  console.log(result.data.totalCoin);
} else {
  console.log(result.code);
}
```

## what this repo does not do

This repo does not install JuanFI, configure MikroTik, replace the JuanFI admin UI, or guarantee support for every JuanFI version.

