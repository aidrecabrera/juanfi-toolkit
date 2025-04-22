export type LegacyActionName =
  | 'insertBtnAction'
  | 'promoBtnAction'
  | 'chargingBtnAction'
  | 'saveVoucherBtnAction'
  | 'convertVoucherAction'
  | 'pause'
  | 'resume'
  | 'cancelPause'
  | 'eloadBtnAction'
  | 'buyEloadAction'
  | 'buyEloadPrevAction'
  | 'loadTypeChanged'
  | 'productTypeChanged'
  | 'onRateTypeChange'
  | 'doLogin'
  | 'doLoginMember';

export type LegacyActions = Partial<Record<LegacyActionName, (...args: readonly unknown[]) => unknown>>;

export function exposeActions(actions: LegacyActions, target: Window & typeof globalThis = window): () => void {
  const previous = new Map<LegacyActionName, unknown>();

  for (const [name, action] of Object.entries(actions) as [LegacyActionName, LegacyActions[LegacyActionName]][]) {
    if (!action) continue;
    previous.set(name, target[name as keyof typeof target]);
    Object.defineProperty(target, name, {
      value: action,
      configurable: true,
      writable: true,
    });
  }

  return () => {
    for (const [name, value] of previous.entries()) {
      if (value === undefined) {
        delete target[name as keyof typeof target];
      } else {
        Object.defineProperty(target, name, {
          value,
          configurable: true,
          writable: true,
        });
      }
    }
  };
}
