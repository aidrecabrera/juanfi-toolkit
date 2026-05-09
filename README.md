<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/juanfi-enhanced.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/juanfi-enhanced.svg">
    <img src="./assets/juanfi-enhanced.svg" width="160" alt="TiniTel logo">
  </picture>
</p>

# juanfi-toolkit

[![npm version](https://img.shields.io/npm/v/@svene/juanfi-api.svg)](https://www.npmjs.com/package/@svene/juanfi-api)
[![npm downloads](https://img.shields.io/npm/dm/@svene/juanfi-api.svg)](https://www.npmjs.com/package/@svene/juanfi-api)
[![npm version](https://img.shields.io/npm/v/@svene/juanfi-hotspot.svg)](https://www.npmjs.com/package/@svene/juanfi-hotspot)
[![npm downloads](https://img.shields.io/npm/dm/@svene/juanfi-hotspot.svg)](https://www.npmjs.com/package/@svene/juanfi-hotspot)
[![npm version](https://img.shields.io/npm/v/@svene/juanfi-admin.svg)](https://www.npmjs.com/package/@svene/juanfi-admin)
[![npm downloads](https://img.shields.io/npm/dm/@svene/juanfi-admin.svg)](https://www.npmjs.com/package/@svene/juanfi-admin)

TypeScript helpers for JuanFI hotspot pages and vendo integrations.

Use this when customizing a JuanFI Piso WiFi setup and you want typed wrappers instead of loose `fetch()` calls and copied page scripts.

## packages

- `@svene/juanfi-api`: calls JuanFI vendo endpoints (portal-side)
- `@svene/juanfi-hotspot`: handles browser-side hotspot flows
- `@svene/juanfi-admin`: typed client for the `/admin/api/*` routes

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
npm run build -w @svene/juanfi-api
npm run build -w @svene/juanfi-hotspot
npm run build -w @svene/juanfi-admin
```

## package overview

### `@svene/juanfi-api`

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

### `@svene/juanfi-hotspot`

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

### `@svene/juanfi-admin`

Typed client for the `/admin/api/*` routes served by the firmware:

- auth (`validateLogin`, `logout`, X-TOKEN header handling)
- dashboard (19-field snapshot) + sales detail + reset statistics
- 65-field system config parser/serializer (preserves tail on partial saves)
- rates (internet + charging)
- charging ports
- active users + kick user
- system logs
- controls (restart, nightLight, scanSSID, scanBuyersQr, testInsertCoin)
- voucher generation + view
- e-load (settings, catalog, transactions, balance check)
- firmware OTA + voucher template upload

## quick example

```ts
import { createJuanFiApi } from '@svene/juanfi-api';

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

