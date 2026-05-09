import { logout, validateLogin } from './auth';
import { fetchActiveUsers, kickActiveUser } from './active-users';
import { fetchChargerPorts, saveChargerPorts } from './charging';
import {
  restartMikrotik,
  restartSystem,
  scanBuyersQr,
  scanSsid,
  testInsertCoin,
  toggleNightLight,
} from './controls';
import {
  fetchDashboard,
  fetchSalesDetail,
  resetStatistic,
} from './dashboard';
import {
  checkEloadBalance,
  fetchEloadCatalog,
  fetchEloadSettings,
  fetchEloadTransactions,
  resetEloadTransactions,
  saveEloadSettings,
  uploadEloadCatalog,
} from './eload';
import { fetchSystemLogs } from './logs';
import { normalizeBaseUrl } from './internal/http';
import {
  fetchChargingRates,
  fetchInternetRates,
  fetchRates,
  saveChargingRates,
  saveInternetRates,
} from './rates';
import {
  fetchSystemConfig,
  saveSystemConfig,
} from './system-config';
import type { AdminCore, JuanFiAdmin, JuanFiAdminOptions } from './types';
import { updateMainBin, uploadVoucherTemplate } from './uploads';
import { fetchVoucherTemplate, generateVouchers } from './vouchers';

function createCore(options: JuanFiAdminOptions): AdminCore {
  return {
    baseUrl: normalizeBaseUrl(options.baseUrl),
    fetch: options.fetch ?? globalThis.fetch.bind(globalThis),
    timeoutMs: options.timeoutMs ?? 10_000,
    state: { token: options.token },
  };
}

export function createJuanFiAdmin(options: JuanFiAdminOptions): JuanFiAdmin {
  const core = createCore(options);

  return {
    validateLogin: async (input) => {
      const result = await validateLogin(core, input);
      if (result.ok) core.state.token = result.token;
      return result;
    },
    logout: () => logout(core),
    setToken: (token) => {
      core.state.token = token;
    },
    getToken: () => core.state.token,

    fetchDashboard: () => fetchDashboard(core),
    fetchSalesDetail: () => fetchSalesDetail(core),
    resetStatistic: (type) => resetStatistic(core, type),

    fetchSystemConfig: () => fetchSystemConfig(core),
    saveSystemConfig: (fields) => saveSystemConfig(core, fields),

    fetchInternetRates: () => fetchInternetRates(core),
    fetchChargingRates: () => fetchChargingRates(core),
    saveInternetRates: (rates) => saveInternetRates(core, rates),
    saveChargingRates: (rates) => saveChargingRates(core, rates),
    fetchRates: (kind) => fetchRates(core, kind),

    fetchChargerPorts: () => fetchChargerPorts(core),
    saveChargerPorts: (ports) => saveChargerPorts(core, ports),

    fetchActiveUsers: () => fetchActiveUsers(core),
    kickActiveUser: (input) => kickActiveUser(core, input),

    fetchSystemLogs: () => fetchSystemLogs(core),

    restartSystem: () => restartSystem(core),
    restartMikrotik: () => restartMikrotik(core),
    toggleNightLight: () => toggleNightLight(core),
    scanSsid: () => scanSsid(core),
    scanBuyersQr: () => scanBuyersQr(core),
    testInsertCoin: (coin) => testInsertCoin(core, coin),

    generateVouchers: (input) => generateVouchers(core, input),
    fetchVoucherTemplate: () => fetchVoucherTemplate(core),

    fetchEloadSettings: () => fetchEloadSettings(core),
    saveEloadSettings: (settings) => saveEloadSettings(core, settings),
    fetchEloadCatalog: () => fetchEloadCatalog(core),
    uploadEloadCatalog: (file) => uploadEloadCatalog(core, file),
    fetchEloadTransactions: () => fetchEloadTransactions(core),
    resetEloadTransactions: () => resetEloadTransactions(core),
    checkEloadBalance: () => checkEloadBalance(core),

    updateMainBin: (binary, filename) => updateMainBin(core, binary, filename),
    uploadVoucherTemplate: (html, filename) => uploadVoucherTemplate(core, html, filename),
  };
}

/** tests only. same AdminCore factory as createJuanFiAdmin without the facade */
export function __createCoreForTesting(options: JuanFiAdminOptions): AdminCore {
  return createCore(options);
}
