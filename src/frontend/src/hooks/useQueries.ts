import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useUploadStatus } from '@/state/uploadStatus';
import { useTransactionCategoryOverrides } from '@/state/transactionCategoryOverrides';
import { useTransactionNeedWantOverrides } from '@/state/transactionNeedWantOverrides';
import type { Card, Transaction, CategoryMapping, CsvColumnMapping, CustomCategory, CategoryType } from '@/backend';

export function useCards() {
  const { actor, isFetching } = useActor();

  return useQuery<Card[]>({
    queryKey: ['cards'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCards();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      color,
      csvMapping,
    }: {
      id: string;
      name: string;
      color: string;
      csvMapping: CsvColumnMapping;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addCard(id, name, csvMapping);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useCustomCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<CustomCategory[]>({
    queryKey: ['customCategories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCustomCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCustomCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, categoryType }: { id: string; name: string; categoryType: CategoryType }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addCustomCategory(id, name, categoryType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customCategories'] });
    },
  });
}

export function useUpdateCustomCategoryType() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, categoryType }: { id: string; categoryType: CategoryType }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateCustomCategoryType(id, categoryType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customCategories'] });
    },
  });
}

export function useAddCategoryMapping() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cardId, mapping }: { cardId: string; mapping: CategoryMapping }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addCategoryMapping(cardId, mapping);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProcessTransactions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cardId, transactions }: { cardId: string; transactions: Transaction[] }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.processImportedTransactions(cardId, transactions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useResetTransactions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { clearAll: clearUploadStatus } = useUploadStatus();
  const { clearAll: clearCategoryOverrides } = useTransactionCategoryOverrides();
  const { clearAll: clearNeedWantOverrides } = useTransactionNeedWantOverrides();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.resetTransactions();
    },
    onSuccess: () => {
      clearUploadStatus();
      clearCategoryOverrides();
      clearNeedWantOverrides();
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
