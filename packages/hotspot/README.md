# @juanfi/hotspot

Browser-side helpers for custom JuanFI hotspot pages.

Use this inside hotspot pages when handling voucher login, coin insertion, e-load, selected vendo logic, timers, labels, or local storage.

## install

```sh
npm install @juanfi/hotspot
```

## voucher login

```ts
import { loginWithVoucher } from '@juanfi/hotspot';

const form = document.querySelector<HTMLFormElement>('#sendin');

if (!form) {
  throw new Error('Missing login form');
}

loginWithVoucher({
  form,
  voucher: 'ABC123',
  loginOption: 1,
  chapId: window.chapId,
  chapChallenge: window.chapChallenge,
});
```

MAC-as-voucher fallback:

```ts
loginWithVoucher({
  form,
  voucher: '',
  mac: 'AA:BB:CC:DD:EE:FF',
  macAsVoucherCode: true,
  loginOption: 1,
});
```

## member login

```ts
import { loginWithMember } from '@juanfi/hotspot';

const sendinForm = document.querySelector<HTMLFormElement>('#sendin');
const loginForm = document.querySelector<HTMLFormElement>('#login');

if (!sendinForm || !loginForm) {
  throw new Error('Missing login forms');
}

loginWithMember({
  sendinForm,
  loginForm,
  chapId: window.chapId,
  chapChallenge: window.chapChallenge,
});
```

## coin flow

`createCoinFlow` starts top-up, polls coin status, saves voucher state, and calls UI hooks.

```ts
import { createCoinFlow } from '@juanfi/hotspot';
import { createJuanFiApi } from '@juanfi/api';

const api = createJuanFiApi({
  vendoIp: '10.1.0.41',
});

const flow = createCoinFlow({
  api,
  mac: 'AA:BB:CC:DD:EE:FF',
  ipAddress: '10.0.0.23',
  pollMs: 1000,

  onStarted(update) {
    console.log('voucher', update.voucher);
  },

  onWaitingForCoin(update) {
    console.log('remaining', update.remainTime);
  },

  onCoinAdded(update) {
    console.log('coins', update.totalCoin);
  },

  onVoucherReady(update) {
    console.log('ready', update.voucher);
  },

  onFailed(error) {
    console.log(error.code, error.error);
  },

  onDone(update) {
    console.log('done', update.voucher);
  },
});

await flow.start();
```

Stop polling:

```ts
flow.stop();
```

Cancel if no coins were inserted:

```ts
await flow.cancel();
```

Save voucher:

```ts
await flow.save();
```

## e-load flow

`createLoadFlow` manages product loading, mobile number entry, product selection, coin polling, and load completion.

```ts
import { createLoadFlow } from '@juanfi/hotspot';
import { createJuanFiApi } from '@juanfi/api';

const api = createJuanFiApi({
  vendoIp: '10.1.0.41',
});

const flow = createLoadFlow({
  api,
  mac: 'AA:BB:CC:DD:EE:FF',
  pollMs: 1000,

  onStep(state) {
    console.log('step', state.step);
  },

  onProducts(products) {
    console.log(products);
  },

  onCoinAdded(update) {
    console.log(update.totalCoin);
  },

  onVoucherReady(update) {
    console.log('leftover voucher', update.voucher);
  },

  onFailed(error) {
    console.log(error.code, error.error);
  },

  onDone(update) {
    console.log('load done', update.voucher);
  },
});

await flow.start();

flow.setMobile('09171234567');
await flow.next();

flow.selectGroup('GLOBE');
flow.selectProduct('GLOBE50');
await flow.next();

await flow.next();
```

Read state:

```ts
const state = flow.getState();

console.log(state.step);
console.log(state.mobile);
console.log(state.selectedProduct);
```

## selected vendo

```ts
import { selectVendo } from '@juanfi/hotspot';

const selected = selectVendo({
  isMultiVendo: true,
  multiVendoOption: 0,
  selectedVendoIp: '10.1.0.41',
  defaultVendoIp: '10.1.0.41',
  multiVendoAddresses: [
    {
      vendoName: 'Main',
      vendoIp: '10.1.0.41',
      chargingEnable: true,
      eloadEnable: true,
    },
  ],
});

console.log(selected.vendoIp);
console.log(selected.showSelector);
```

`multiVendoOption`:

* `0`: use selected IP and show selector
* `1`: match hotspot address
* `2`: match interface name

## storage

Storage shape:

```ts
type StoragePort = {
  readonly saveValue: (key: string, value: string) => void;
  readonly readValue: (key: string) => string | null;
  readonly removeValue: (key: string) => void;
};
```

Custom storage:

```ts
const memoryStorage = new Map<string, string>();

const storage = {
  saveValue(key: string, value: string) {
    memoryStorage.set(key, value);
  },
  readValue(key: string) {
    return memoryStorage.get(key) ?? null;
  },
  removeValue(key: string) {
    memoryStorage.delete(key);
  },
};
```

Use it:

```ts
const flow = createCoinFlow({
  api,
  mac: 'AA:BB:CC:DD:EE:FF',
  storage,
});
```

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@juanfi/hotspot@0.1.0/dist/index.iife.js"></script>
```

Browser global:

```js
JuanFiHotspot.loginWithVoucher({
  form: document.querySelector('#sendin'),
  voucher: 'ABC123',
  loginOption: 1,
});
```

Download:

```sh
curl -L -o juanfi-hotspot.js https://cdn.jsdelivr.net/npm/@juanfi/hotspot@0.1.0/dist/index.iife.js
```

Do not use `latest` in production. Always pin the version.

## scripts

```sh
npm run test -w @juanfi/hotspot
npm run build -w @juanfi/hotspot
```
