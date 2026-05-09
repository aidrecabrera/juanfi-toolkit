import { describe, expect, it } from 'vitest';
import {
  SYSTEM_CONFIG_FIELD_COUNT,
  SYSTEM_CONFIG_LEGACY_COUNT,
  configField,
  mergeSystemConfig,
  parseSystemConfig,
  readFieldAsInt,
  serializeSystemConfig,
} from './system-config';

// verbatim compat fixtures from firmware. drift here hides real breakage

const SYSTEM_65 =
  'FI Machine|FI Setup||10.0.0.1|pisonet|abc123|30|admin|admin|3|30|13|12|5|23|0|14|0|P|This is marquee|0|0|default|0|1|0|||||1|1|2|operator|operator||-1|1|4|1|1|21|22|-1|10|-1|0||5|0|1|Welcome to||Pls Insert coin|Thank you!|0|0|-1|9600|20|30|-1|-1|-1|-1';

const SYSTEM_30 =
  'FI Machine|FI Setup||10.0.0.1|pisonet|abc123|30|admin|admin|3|30|13|12|5|23|0|14|0|P|This is marquee|0|0|default|0|1|0|||||';

describe('constants', () => {
  it('match firmware limits', () => {
    expect(SYSTEM_CONFIG_FIELD_COUNT).toBe(65);
    expect(SYSTEM_CONFIG_LEGACY_COUNT).toBe(30);
  });
});

describe('configField map', () => {
  it('assigns the published positions', () => {
    /* spot check against facts.hpp. full map is configField */
    expect(configField.vendoName).toBe(0);
    expect(configField.wifiSsid).toBe(1);
    expect(configField.mikrotikIp).toBe(3);
    expect(configField.coinWaitSeconds).toBe(6);
    expect(configField.staticDns).toBe(29);
    expect(configField.coinSlotMode).toBe(30);
    expect(configField.singleCoinPulseCount).toBe(31);
    expect(configField.lanCsPin).toBe(48);
    expect(configField.buzzerPin).toBe(57);
    expect(configField.ethMdioPin).toBe(64);
  });
});

describe('parseSystemConfig / serializeSystemConfig', () => {
  it('round-trips the full 65-field fixture byte-for-byte', () => {
    const parsed = parseSystemConfig(SYSTEM_65);
    const round = serializeSystemConfig(parsed);
    expect(round).toBe(SYSTEM_65);
  });

  it('reads the expected values from the 65-field fixture', () => {
    const cfg = parseSystemConfig(SYSTEM_65);
    expect(cfg.vendoName).toBe('FI Machine');
    expect(cfg.wifiSsid).toBe('FI Setup');
    expect(cfg.wifiPassword).toBe('');
    expect(cfg.mikrotikIp).toBe('10.0.0.1');
    expect(cfg.routerUser).toBe('pisonet');
    expect(cfg.routerPassword).toBe('abc123');
    expect(cfg.coinWaitSeconds).toBe('30');
    expect(cfg.adminUser).toBe('admin');
    expect(cfg.adminPassword).toBe('admin');
    expect(cfg.coinSlotMode).toBe('1');
    expect(cfg.singleCoinPulseCount).toBe('1');
    expect(cfg.operatorUser).toBe('operator');
    expect(cfg.operatorPassword).toBe('operator');
    expect(cfg.buzzerPin).toBe('-1');
    expect(cfg.ethMdioPin).toBe('-1');
  });

  it('pads a 30-field legacy fixture up to 65 positions on parse', () => {
    const cfg = parseSystemConfig(SYSTEM_30);
    expect(cfg.vendoName).toBe('FI Machine');
    expect(cfg.staticDns).toBe('');
    /* legacy fixture stops at index 29. parser pads empty strings not holes */
    expect(cfg.coinSlotMode).toBe('');
    expect(cfg.operatorUser).toBe('');
    expect(cfg.ethMdioPin).toBe('');
  });

  it('serialize always emits 65 positions even when parsed from a 30-field input', () => {
    const cfg = parseSystemConfig(SYSTEM_30);
    const round = serializeSystemConfig(cfg);
    expect(round.split('|')).toHaveLength(65);
  });
});

describe('mergeSystemConfig', () => {
  it('preserves unchanged fields, including tail positions 30..64', () => {
    const base = parseSystemConfig(SYSTEM_65);
    const partial = { vendoName: 'Shop A', wifiSsid: 'ShopNet' };
    const merged = mergeSystemConfig(base, partial);

    expect(merged.vendoName).toBe('Shop A');
    expect(merged.wifiSsid).toBe('ShopNet');
    /* don't wipe tail slots when only header fields edited */
    expect(merged.coinSlotMode).toBe(base.coinSlotMode);
    expect(merged.operatorUser).toBe(base.operatorUser);
    expect(merged.buzzerPin).toBe(base.buzzerPin);
    expect(merged.ethMdioPin).toBe(base.ethMdioPin);
  });

  it('serialized output of a merged config still round-trips tail bytes', () => {
    const base = parseSystemConfig(SYSTEM_65);
    const merged = mergeSystemConfig(base, { vendoName: 'Edited' });
    const serialized = serializeSystemConfig(merged);

    /* serialize expands back to 65 cells. expect single-field delta vs golden */
    const originalFields = SYSTEM_65.split('|');
    const newFields = serialized.split('|');
    expect(newFields[0]).toBe('Edited');
    for (let i = 1; i < 65; i++) {
      expect(newFields[i]).toBe(originalFields[i]);
    }
  });
});

describe('readFieldAsInt', () => {
  it('reads int fields with sensible fallback', () => {
    const cfg = parseSystemConfig(SYSTEM_65);
    expect(readFieldAsInt(cfg, 'coinWaitSeconds')).toBe(30);
    expect(readFieldAsInt(cfg, 'coinPin')).toBe(13);
    expect(readFieldAsInt(cfg, 'singleCoinPulseCount')).toBe(1);
    expect(readFieldAsInt(cfg, 'buzzerPin', 99)).toBe(-1);
  });

  it('returns fallback when a field is empty', () => {
    const cfg = parseSystemConfig(SYSTEM_30);
    expect(readFieldAsInt(cfg, 'operatorUser' as never, 42)).toBe(42);
  });
});
