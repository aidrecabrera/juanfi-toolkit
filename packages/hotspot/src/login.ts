import type { LoginOption, StoragePort } from './types';
import { defaultStorage } from './storage';
import { getFormValue, setFormValue, submitForm } from './internal/form';
import { hexMd5 } from './internal/md5';

export function loginWithVoucher(input: {
  readonly form: HTMLFormElement;
  readonly voucher: string;
  readonly chapId?: string;
  readonly chapChallenge?: string;
  readonly loginOption: LoginOption;
  readonly mac?: string;
  readonly macAsVoucherCode?: boolean;
  readonly storage?: StoragePort;
  readonly submit?: boolean;
  readonly now?: () => number;
}): string {
  const storage = input.storage ?? defaultStorage;
  let voucher = input.voucher;

  if (input.macAsVoucherCode && voucher === '' && input.mac) {
    voucher = removeMacColons(input.mac);
  }

  storage.saveValue('activeVoucher', voucher);
  applyTempValidity(storage, voucher, input.now ?? Date.now);

  setFormValue(input.form, 'username', voucher);
  const password = input.loginOption === 0 ? '' : voucher;
  setFormValue(input.form, 'password', chapPassword(password, input.chapId, input.chapChallenge));

  if (input.submit ?? true) submitForm(input.form);
  return voucher;
}

export function loginWithMember(input: {
  readonly sendinForm: HTMLFormElement;
  readonly loginForm: HTMLFormElement;
  readonly chapId?: string;
  readonly chapChallenge?: string;
  readonly submit?: boolean;
}): void {
  const username = getFormValue(input.loginForm, 'username');
  const password = getFormValue(input.loginForm, 'password');
  setFormValue(input.sendinForm, 'username', username);
  setFormValue(input.sendinForm, 'password', chapPassword(password, input.chapId, input.chapChallenge));
  if (input.submit ?? true) submitForm(input.sendinForm);
}

export function chapPassword(password: string, chapId?: string, chapChallenge?: string): string {
  if (chapId === undefined || chapChallenge === undefined) return password;
  return hexMd5(`${chapId}${password}${chapChallenge}`);
}

export function removeMacColons(mac: string): string {
  return mac.replaceAll(':', '');
}

function applyTempValidity(storage: StoragePort, voucher: string, now: () => number): void {
  const validity = storage.readValue(`${voucher}validity`);
  const tempValidity = storage.readValue(`${voucher}tempValidity`);
  if (tempValidity === null) return;

  let currentExpireDate = new Date(now());
  if (validity !== null) currentExpireDate = new Date(Number.parseInt(validity, 10));

  const minutes = Number.parseInt(tempValidity, 10);
  const expireDate = new Date(currentExpireDate.getTime() + minutes * 60_000);
  const currentDate = new Date(now());

  if (expireDate.getTime() < currentDate.getTime()) {
    storage.removeValue(`${voucher}validity`);
    storage.removeValue(`${voucher}tempValidity`);
    return;
  }

  storage.saveValue(`${voucher}validity`, String(expireDate.getTime()));
  storage.removeValue(`${voucher}tempValidity`);
}
