import { describe, expect, it } from 'vitest';
import {
  parseChargingRates,
  parseInternetRates,
  serializeChargingRates,
  serializeInternetRates,
} from './rates';
import {
  parseChargerPorts,
  serializeChargerPorts,
} from './charging';
import { parseActiveUsers } from './active-users';
import { parseSystemLogs } from './logs';
import {
  parseGenerateVouchersResult,
} from './vouchers';
import {
  parseEloadSettings,
  serializeEloadSettings,
} from './eload';

// sample bodies from firmware valid/*.data. touch together when fixtures move

const RATES_INTERNET =
  '1 peso / 10min#1#10#20##|5 peso / 1hour#5#60#120##|10 peso / 2hour#10#120#240##|50 peso / 3Days#50#4320#7200##|100 peso / 7Days#100#10080#14400##';

const RATES_CHARGING = '1 peso / 10min#1#10|5 peso / 1hour#5#60|10 peso / 2hour#10#120';

const CHARGING_PORTS = 'Port 1#-1#1#0#0|Port 2#-1#1#0#0|Port 3#-1#1#0#0|Port 4#-1#1#0#0';

describe('parseInternetRates / serializeInternetRates', () => {
  it('parses the default 5-rate fixture', () => {
    const rates = parseInternetRates(RATES_INTERNET);
    expect(rates).toHaveLength(5);
    expect(rates[0]?.name).toBe('1 peso / 10min');
    expect(rates[0]?.price).toBe(1);
    expect(rates[0]?.minutes).toBe(10);
    expect(rates[0]?.validityMinutes).toBe(20);
    expect(rates[0]?.dataMb).toBe('');
    expect(rates[0]?.profile).toBe('');
    expect(rates[4]?.price).toBe(100);
    expect(rates[4]?.minutes).toBe(10080);
  });

  it('round-trips the 5-rate fixture byte-for-byte', () => {
    const rates = parseInternetRates(RATES_INTERNET);
    expect(serializeInternetRates(rates)).toBe(RATES_INTERNET);
  });
});

describe('parseChargingRates / serializeChargingRates', () => {
  it('parses the 3-rate fixture', () => {
    const rates = parseChargingRates(RATES_CHARGING);
    expect(rates).toHaveLength(3);
    expect(rates[0]?.name).toBe('1 peso / 10min');
    expect(rates[0]?.price).toBe(1);
    expect(rates[2]?.minutes).toBe(120);
  });

  it('round-trips the charging fixture', () => {
    const rates = parseChargingRates(RATES_CHARGING);
    expect(serializeChargingRates(rates)).toBe(RATES_CHARGING);
  });
});

describe('parseChargerPorts / serializeChargerPorts', () => {
  it('parses the default 4-port fixture', () => {
    const ports = parseChargerPorts(CHARGING_PORTS);
    expect(ports).toHaveLength(4);
    for (const port of ports) {
      expect(port.pin).toBe(-1);
      expect(port.trigger).toBe(1);
      expect(port.offTimeEpoch).toBe(0);
      expect(port.sales).toBe(0);
    }
    expect(ports[0]?.name).toBe('Port 1');
    expect(ports[3]?.name).toBe('Port 4');
  });

  it('round-trips the charging ports fixture', () => {
    const ports = parseChargerPorts(CHARGING_PORTS);
    expect(serializeChargerPorts(ports)).toBe(CHARGING_PORTS);
  });
});

describe('parseActiveUsers', () => {
  it('parses id#voucher#mac#sessionLeft pipe rows', () => {
    const raw = 'u1#VCH1#AA:BB:CC:DD:EE:FF#01:23:45|u2#VCH2#11:22:33:44:55:66#00:15:00';
    const users = parseActiveUsers(raw);
    expect(users).toHaveLength(2);
    expect(users[0]?.id).toBe('u1');
    expect(users[0]?.voucher).toBe('VCH1');
    expect(users[0]?.mac).toBe('AA:BB:CC:DD:EE:FF');
    expect(users[0]?.sessionLeft).toBe('01:23:45');
  });

  it('returns empty array on empty body', () => {
    expect(parseActiveUsers('')).toHaveLength(0);
  });
});

describe('parseSystemLogs', () => {
  it('splits on | and preserves row content', () => {
    const raw = '12s ago: Coin accepted|34s ago: Voucher issued|1m ago: Admin login';
    const rows = parseSystemLogs(raw);
    expect(rows).toHaveLength(3);
    expect(rows[0]?.raw).toContain('Coin accepted');
  });
});

describe('parseGenerateVouchersResult', () => {
  it('extracts vendoName, amount, seconds, and voucher codes', () => {
    const raw = 'FI Machine|20|1200|ABC123#DEF456#GHI789';
    const result = parseGenerateVouchersResult(raw);
    expect(result.vendoName).toBe('FI Machine');
    expect(result.amountPerVoucher).toBe(20);
    expect(result.secondsPerVoucher).toBe(1200);
    expect(result.vouchers).toEqual(['ABC123', 'DEF456', 'GHI789']);
    expect(result.raw).toBe(raw);
  });

  it('returns zero vouchers when the tail is empty', () => {
    const raw = 'FI Machine|20|0|';
    const result = parseGenerateVouchersResult(raw);
    expect(result.vouchers).toHaveLength(0);
  });
});

describe('parseEloadSettings / serializeEloadSettings', () => {
  it('parses default disabled payload', () => {
    const settings = parseEloadSettings('0|0||');
    expect(settings.enabled).toBe(false);
    expect(settings.apiFlag).toBe('0');
    expect(settings.apiKey).toBe('');
    expect(settings.extra).toBe('');
  });

  it('round-trips an enabled payload', () => {
    const input = '1|1|secret-key|extra-data';
    const settings = parseEloadSettings(input);
    expect(settings.enabled).toBe(true);
    expect(serializeEloadSettings(settings)).toBe(input);
  });
});
