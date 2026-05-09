/*
 * byte-for-byte with firmware/include/facts.hpp namespace route
 * typos like toggerNightLight are part of the contract. don't fix unless firmware does
 */

export const adminRoutes = {
  validateLogin: '/validateLogin',
  logout: '/admin/api/logout',

  dashboard: '/admin/api/dashboard',
  salesDetail: '/admin/api/getSalesDetail',

  getSystemConfig: '/admin/api/getSystemConfig',
  saveSystemConfig: '/admin/api/saveSystemConfig',

  getRates: '/admin/api/getRates',
  saveRates: '/admin/api/saveRates',

  getChargerSettings: '/admin/api/getChargerSettings',
  saveChargerSetting: '/admin/api/saveChargerSetting',

  getActiveUsers: '/admin/api/getActiveUsers',
  kickActiveUser: '/admin/api/kickActiveUser',

  getSystemLogs: '/admin/api/getSystemLogs',

  resetStatistic: '/admin/api/resetStatistic',
  scanSSID: '/admin/api/scanSSID',
  restartSystem: '/admin/api/restartSystem',
  restartMikrotik: '/admin/api/restartMikrotik',
  toggleNightLight: '/admin/api/toggerNightLight',
  scanBuyersQr: '/admin/api/scanBuyersQr',
  testInsertCoin: '/testInsertCoin',

  generateVouchers: '/admin/api/generateVouchers',
  viewGeneratedVouchers: '/admin/viewGeneratedVouchers',
  uploadVoucherTemplate: '/admin/api/uploadVoucherTemplate',

  eloadGetSetting: '/admin/api/eload/getSetting',
  eloadSaveSetting: '/admin/api/eload/saveSetting',
  eloadGetRates: '/admin/api/eload/getRates',
  eloadUploadRates: '/admin/api/eload/uploadRates',
  eloadGetTransactions: '/admin/api/eload/getTrxs',
  eloadResetTransactions: '/admin/api/eload/resetTrxs',
  eloadCheckBalance: '/admin/api/eload/checkBalance',

  updateMainBin: '/admin/updateMainBin',

  health: '/health',
} as const;

export type AdminRoute = keyof typeof adminRoutes;
