import { create } from 'zustand';

interface UploadStatusState {
  uploadedCards: Set<string>;
  markUploaded: (cardId: string) => void;
  isUploaded: (cardId: string) => boolean;
  clearAll: () => void;
}

export const useUploadStatus = create<UploadStatusState>((set, get) => ({
  uploadedCards: new Set(),
  markUploaded: (cardId: string) =>
    set((state) => ({
      uploadedCards: new Set(state.uploadedCards).add(cardId),
    })),
  isUploaded: (cardId: string) => get().uploadedCards.has(cardId),
  clearAll: () => set({ uploadedCards: new Set() }),
}));
