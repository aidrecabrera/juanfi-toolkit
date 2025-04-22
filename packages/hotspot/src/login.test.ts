import { describe, expect, it, vi } from 'vitest';
import { chapPassword, loginWithMember, loginWithVoucher } from './login';
import type { StoragePort } from './types';

function form(fields: readonly string[]) {
  const values = new Map(fields.map((name) => [name, { value: '' }]));
  return {
    values,
    submit: vi.fn(),
    elements: {
      namedItem(name: string) {
        return values.get(name) ?? null;
      },
    },
  } as unknown as HTMLFormElement & { values: Map<string, { value: string }>; submit: ReturnType<typeof vi.fn> };
}

function memoryStorage(): StoragePort {
  const data = new Map<string, string>();
  return {
    saveValue: (key, value) => data.set(key, value),
    readValue: (key) => data.get(key) ?? null,
    removeValue: (key) => data.delete(key),
  };
}

describe('login helpers', () => {
  it('voucher login uses empty password when loginOption = 0', () => {
    const sendin = form(['username', 'password']);

    loginWithVoucher({
      form: sendin,
      voucher: 'ABC123',
      loginOption: 0,
      chapId: 'id',
      chapChallenge: 'challenge',
      storage: memoryStorage(),
      submit: false,
    });

    expect(sendin.values.get('username')?.value).toBe('ABC123');
    expect(sendin.values.get('password')?.value).toBe(chapPassword('', 'id', 'challenge'));
  });

  it('voucher login uses voucher password when loginOption = 1', () => {
    const sendin = form(['username', 'password']);

    loginWithVoucher({
      form: sendin,
      voucher: 'ABC123',
      loginOption: 1,
      chapId: 'id',
      chapChallenge: 'challenge',
      storage: memoryStorage(),
      submit: false,
    });

    expect(sendin.values.get('password')?.value).toBe(chapPassword('ABC123', 'id', 'challenge'));
  });

  it('member login hashes member password', () => {
    const sendin = form(['username', 'password']);
    const login = form(['username', 'password']);
    login.values.get('username')!.value = 'member';
    login.values.get('password')!.value = 'secret';

    loginWithMember({
      sendinForm: sendin,
      loginForm: login,
      chapId: 'id',
      chapChallenge: 'challenge',
      submit: false,
    });

    expect(sendin.values.get('username')?.value).toBe('member');
    expect(sendin.values.get('password')?.value).toBe(chapPassword('secret', 'id', 'challenge'));
  });

  it('macAsVoucherCode removes colons from MAC', () => {
    const sendin = form(['username', 'password']);
    const voucher = loginWithVoucher({
      form: sendin,
      voucher: '',
      loginOption: 0,
      mac: 'AA:BB:CC:DD:EE:FF',
      macAsVoucherCode: true,
      storage: memoryStorage(),
      submit: false,
    });

    expect(voucher).toBe('AABBCCDDEEFF');
    expect(sendin.values.get('username')?.value).toBe('AABBCCDDEEFF');
  });
});
