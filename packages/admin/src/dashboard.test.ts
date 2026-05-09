import { describe, expect, it } from 'vitest';
import { DASHBOARD_FIELD_COUNT, parseDashboard } from './dashboard';

// hand-built dashboard pipes. column order matches dashboardField
const DASHBOARD_ESP32 =
  '12345678|500|120|3|1|1|AA:BB:CC:DD:EE:FF|192.168.1.2|ESP32|v4.4|WIRELESS|78|215000|1|0|2|1715000000||';

const DASHBOARD_ESP32_LAN =
  '100000|0|0|0|1|0|FF:EE:DD:CC:BB:AA|10.0.0.2|ESP32|v4.4|LAN|0|180000|0|0|0|||1';

describe('parseDashboard', () => {
  it('emits the correct field count constant', () => {
    expect(DASHBOARD_FIELD_COUNT).toBe(19);
  });

  it('parses a wireless-interface snapshot', () => {
    const snap = parseDashboard(DASHBOARD_ESP32);
    expect(snap.uptimeMs).toBe(12345678);
    expect(snap.lifetimeSales).toBe(500);
    expect(snap.currentSales).toBe(120);
    expect(snap.customerCount).toBe(3);
    expect(snap.internetStatus).toBe(true);
    expect(snap.routerConnected).toBe(true);
    expect(snap.macAddress).toBe('AA:BB:CC:DD:EE:FF');
    expect(snap.ipAddress).toBe('192.168.1.2');
    expect(snap.deviceType).toBe('ESP32');
    expect(snap.compatibilityVersion).toBe('v4.4');
    expect(snap.interfaceType).toBe('WIRELESS');
    expect(snap.signalPercent).toBe(78);
    expect(snap.freeHeap).toBe(215000);
    expect(snap.authType).toBe(1);
    expect(snap.activeUsers).toBe(2);
    expect(snap.epochSeconds).toBe(1715000000);
    expect(snap.lanType).toBeUndefined();
  });

  it('parses a LAN-interface snapshot (lanType set, epoch empty)', () => {
    const snap = parseDashboard(DASHBOARD_ESP32_LAN);
    expect(snap.interfaceType).toBe('LAN');
    expect(snap.lanType).toBe('1');
    expect(snap.epochSeconds).toBeUndefined();
  });

  it('tolerates truncated input by padding with empty strings', () => {
    const snap = parseDashboard('123|0|0|0|1');
    expect(snap.uptimeMs).toBe(123);
    expect(snap.macAddress).toBe('');
    expect(snap.compatibilityVersion).toBe('');
  });

  it('preserves raw payload for diagnostics', () => {
    const snap = parseDashboard(DASHBOARD_ESP32);
    expect(snap.raw).toBe(DASHBOARD_ESP32);
  });
});
