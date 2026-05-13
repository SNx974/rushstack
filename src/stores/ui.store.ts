import { create } from 'zustand';

interface UiStore {
  sidebarOpen: boolean;
  activeGameId: string | null;
  activeMatchId: string | null;

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveGame: (gameId: string | null) => void;
  setActiveMatch: (matchId: string | null) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  sidebarOpen: false,
  activeGameId: null,
  activeMatchId: null,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveGame: (gameId) => set({ activeGameId: gameId }),
  setActiveMatch: (matchId) => set({ activeMatchId: matchId }),
}));
