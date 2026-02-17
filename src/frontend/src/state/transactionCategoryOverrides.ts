import { create } from 'zustand';

// Generate a deterministic key for each transaction
export function getTransactionKey(transaction: { date: string; description: string; amount: number }): string {
  return `${transaction.date}|${transaction.description}|${transaction.amount}`;
}

interface TransactionCategoryOverridesState {
  overrides: Map<string, string>; // transactionKey -> customCategoryID
  setOverride: (transactionKey: string, categoryId: string) => void;
  clearOverride: (transactionKey: string) => void;
  clearAll: () => void;
  getOverride: (transactionKey: string) => string | undefined;
}

export const useTransactionCategoryOverrides = create<TransactionCategoryOverridesState>((set, get) => ({
  overrides: new Map(),
  
  setOverride: (transactionKey: string, categoryId: string) => {
    set((state) => {
      const newOverrides = new Map(state.overrides);
      newOverrides.set(transactionKey, categoryId);
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
