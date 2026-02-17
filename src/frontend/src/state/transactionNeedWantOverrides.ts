import { create } from 'zustand';
import { getTransactionKey } from './transactionCategoryOverrides';

export type NeedWantOverride = 'auto' | 'need' | 'want';

interface TransactionNeedWantOverridesState {
  overrides: Map<string, NeedWantOverride>; // transactionKey -> need/want/auto
  setOverride: (transactionKey: string, value: NeedWantOverride) => void;
  clearOverride: (transactionKey: string) => void;
  clearAll: () => void;
  getOverride: (transactionKey: string) => NeedWantOverride | undefined;
}

export const useTransactionNeedWantOverrides = create<TransactionNeedWantOverridesState>((set, get) => ({
  overrides: new Map(),
  
  setOverride: (transactionKey: string, value: NeedWantOverride) => {
    set((state) => {
      const newOverrides = new Map(state.overrides);
      if (value === 'auto') {
        // Remove override when set to auto
        newOverrides.delete(transactionKey);
      } else {
        newOverrides.set(transactionKey, value);
      }
      return { overrides: newOverrides };
    });
  },
  
  clearOverride: (transactionKey: string) => {
    set((state) => {
      const newOverrides = new Map(state.overrides);
      newOverrides.delete(transactionKey);
      return { overrides: newOverrides };
    });
  },
  
  clearAll: () => {
    set({ overrides: new Map() });
  },
  
  getOverride: (transactionKey: string) => {
    return get().overrides.get(transactionKey);
  },
}));

export { getTransactionKey };
