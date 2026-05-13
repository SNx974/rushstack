import { create } from 'zustand';
import type { QueueEntry } from '@/types';

interface QueueStore {
  myEntries: Record<string, QueueEntry>; // gameId -> entry
  searchingGameId: string | null;

  setEntry: (gameId: string, entry: QueueEntry) => void;
  removeEntry: (gameId: string) => void;
  setSearchingGame: (gameId: string | null) => void;
  isInQueue: (gameId: string) => boolean;
}

export const useQueueStore = create<QueueStore>((set, get) => ({
  myEntries: {},
  searchingGameId: null,

  setEntry: (gameId, entry) =>
    set((s) => ({ myEntries: { ...s.myEntries, [gameId]: entry } })),

  removeEntry: (gameId) =>
    set((s) => {
      const { [gameId]: _, ...rest } = s.myEntries;
      return { myEntries: rest, searchingGameId: s.searchingGameId === gameId ? null : s.searchingGameId };
    }),

  setSearchingGame: (gameId) => set({ searchingGameId: gameId }),

  isInQueue: (gameId) => {
    const entry = get().myEntries[gameId];
    return !!entry && entry.status === 'searching';
  },
}));
