# @svene/juanfi-admin

Typed admin client for JuanFI v4.x/v5 firmware. Drives the `/admin/api/*` routes served by the ESP32/ESP8266 firmware, with parsers + serializers for the plain-text pipe-delimited wire contract.

Sister package to:

- `[@svene/juanfi-api](https://www.npmjs.com/package/@svene/juanfi-api)`: portal routes (`/topUp`, `/checkCoin`, ...)
- `[@svene/juanfi-hotspot](https://www.npmjs.com/package/@svene/juanfi-hotspot)`: captive-portal browser helpers

## install

```
npm install @svene/juanfi-admin
```

## quick start

```ts
import { createJuanFiAdmin } from '@svene/juanfi-admin';

const admin = createJuanFiAdmin({ baseUrl: 'http://10.0.0.1' });

const login = await admin.validateLogin({ username: 'admin', password: 'secret' });
if (!login.ok) throw new Error(login.message);

const dashboard = await admin.fetchDashboard();
console.log(dashboard.currentSales, dashboard.activeUsers);

const cfg = await admin.fetchSystemConfig();
const updated = { ...cfg, vendoName: 'Shop A' };
await admin.saveSystemConfig(updated);   // always writes all 65 slots
```

## covered routes

All routes below are driven; responses are parsed into typed records.

- Auth: `POST /validateLogin`, `POST /admin/api/logout`
- Dashboard: `GET /admin/api/dashboard` (19 fields), `GET /admin/api/getSalesDetail`, `POST /admin/api/resetStatistic`
- System config: `GET/POST /admin/api/getSystemConfig`, `saveSystemConfig` (65 positional fields)
- Rates: `GET/POST /admin/api/{getRates,saveRates}` with `rateType=1|2`
- Charging: `GET/POST /admin/api/{getChargerSettings,saveChargerSetting}`
- Active users: `GET /admin/api/getActiveUsers`, `POST /admin/api/kickActiveUser` (`userId=` + `voucher=`)
- Logs: `GET /admin/api/getSystemLogs`
- Controls: restartSystem, restartMikrotik, `toggerNightLight` (firmware typo preserved), scanSSID, scanBuyersQr, testInsertCoin
- Vouchers: `POST /admin/api/generateVouchers` (`amt=`, `qty=`, `sales=`, `pfx=`), `GET /admin/viewGeneratedVouchers`
- Eload: getSetting/saveSetting/getRates/uploadRates/getTrxs/resetTrxs/checkBalance
- Uploads: `updateMainBin` (firmware OTA), `uploadVoucherTemplate`

## system config: 65-field positional layout

Wire format is pipe-delimited positional. Legacy 30-field saves are still accepted by firmware; everything past field 29 is preserved on partial updates.

```ts
import { parseSystemConfig, serializeSystemConfig, mergeSystemConfig, configField }
  from '@svene/juanfi-admin';

const loaded = await admin.fetchSystemConfig();
const partial = { vendoName: 'Shop A' };
const merged = mergeSystemConfig(loaded, partial);
await admin.saveSystemConfig(merged);

console.log(configField.ethMdioPin); // 64
```

See `src/system-config.ts` for the full field map. It mirrors `firmware/include/facts.hpp` `namespace fi::config_field`.

## auth

```ts
const admin = createJuanFiAdmin({ baseUrl: 'http://10.0.0.1' });
const login = await admin.validateLogin({ username: 'admin', password: 'secret' });
// When login.ok === true, token is cached; X-TOKEN header is sent on subsequent calls.

// Persist and re-hydrate:
const token = admin.getToken();            // save to localStorage
const admin2 = createJuanFiAdmin({ baseUrl: 'http://10.0.0.1', token });

await admin2.logout(); // token cleared regardless of server response
```

## what this package does not do

- No built-in captive portal flow (see `@svene/juanfi-hotspot`)
- No portal-side vendo API (see `@svene/juanfi-api`)
- No MikroTik FTP automation
- No firmware flashing (use PlatformIO)

