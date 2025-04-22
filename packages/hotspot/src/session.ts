import type { StoragePort } from './types';
import { defaultStorage } from './storage';

export type ValidityResult =
  | { readonly type: 'date'; readonly date: Date }
  | { readonly type: 'none' }
  | { readonly type: 'not-available' };

export function pauseTime(input: {
  readonly logoutForm: HTMLFormElement;
  readonly remainTime: string;
  readonly voucher?: string;
  readonly storage?: StoragePort;
}): void {
  const storage = input.storage ?? defaultStorage;
  const voucher = input.voucher ?? storage.readValue('activeVoucher') ?? '';
  storage.saveValue('isPaused', '1');
  storage.saveValue(`${voucher}remain`, input.remainTime);
  input.logoutForm.submit();
}

export function resumeTime(input: {
  readonly storage?: StoragePort;
  readonly reload?: () => void;
} = {}): void {
  const storage = input.storage ?? defaultStorage;
  storage.removeValue('isPaused');
  storage.removeValue('activeVoucher');
  storage.removeValue('ignoreSaveCode');
  (input.reload ?? (() => globalThis.location?.reload()))();
}

export function logoutUser(input: {
  readonly form: HTMLFormElement;
  readonly eraseCookie?: boolean;
}): void {
  if (input.eraseCookie) {
    const existing = input.form.elements.namedItem('erase-cookie');
    const field = existing instanceof HTMLInputElement ? existing : document.createElement('input');
    field.type = 'hidden';
    field.name = 'erase-cookie';
    field.value = 'true';
    if (!existing) input.form.append(field);
  }
  input.form.submit();
}

export function cancelPause(input: {
  readonly logoutForm: HTMLFormElement;
  readonly storage?: StoragePort;
  readonly confirm?: () => boolean;
}): void {
  if (!(input.confirm ?? (() => globalThis.confirm('Are you sure you want to cancel the session?')))()) return;
  const storage = input.storage ?? defaultStorage;
  storage.removeValue('isPaused');
  storage.removeValue('activeVoucher');
  storage.saveValue('forceLogout', '1');
  input.logoutForm.submit();
}

export function parseValidity(raw: string, now: Date = new Date()): ValidityResult {
  if (raw.length === 0) return { type: 'none' };

  if (raw.length > 15) return { type: 'date', date: new Date(Date.parse(raw)) };

  if (raw.length > 8) {
    const [datePart = '', timePart = ''] = raw.split(' ');
    return { type: 'date', date: new Date(Date.parse(`${datePart}/${now.getFullYear()} ${timePart}`)) };
  }

  const month = now.getMonth() + 1;
  const day = now.getDate();
  const year = now.getFullYear();
  return { type: 'date', date: new Date(Date.parse(`${month}/${day}/${year} ${raw}`)) };
}

export function fallbackValidity(input: {
  readonly voucher: string;
  readonly storage?: StoragePort;
  readonly now?: () => number;
}): ValidityResult {
  const storage = input.storage ?? defaultStorage;
  const validity = storage.readValue(`${input.voucher}validity`);
  if (validity === null) return { type: 'not-available' };

  const validityTime = new Date(Number.parseInt(validity, 10));
  if (validityTime.getTime() < (input.now ?? Date.now)()) {
    storage.removeValue(`${input.voucher}validity`);
    storage.removeValue(`${input.voucher}tempValidity`);
    return { type: 'not-available' };
  }

  return { type: 'date', date: validityTime };
}
