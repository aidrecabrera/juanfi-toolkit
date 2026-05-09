import type { StoragePort } from './types';

export function saveValue(key: string, value: string): void {
  const storage = getLocalStorage();
  if (storage) {
    storage.setItem(key, value);
    return;
  }
  // cookie path=/ fallback. different limits than LS and cookies ride http requests
  setCookie(key, value, 364);
}

export function readValue(key: string): string | null {
  const storage = getLocalStorage();
  if (storage) return storage.getItem(key);
  return getCookie(key);
}

export function removeValue(key: string): void {
  const storage = getLocalStorage();
  if (storage) {
    storage.removeItem(key);
    return;
  }
  eraseCookie(key);
}

export const defaultStorage: StoragePort = {
  saveValue,
  readValue,
  removeValue,
};

export const setStorageValue = saveValue;
export const getStorageValue = readValue;
export const removeStorageValue = removeValue;

function getLocalStorage(): Storage | null {
  try {
    // SecurityError or denied storage in some captive/private iframe cases
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEq = `${name}=`;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    let current = part;
    while (current.charAt(0) === ' ') current = current.substring(1);
    if (current.indexOf(nameEq) === 0) return current.substring(nameEq.length);
  }
  return null;
}

function eraseCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=-99999999; path=/`;
}
