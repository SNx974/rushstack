import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,    // 2 minutes
      gcTime: 1000 * 60 * 10,      // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query key factory — prevents typos and enables precise invalidation
export const queryKeys = {
  profiles: {
    all: ['profiles'] as const,
    detail: (id: string) => ['profiles', id] as const,
    me: ['profiles', 'me'] as const,
  },
  games: {
    all: ['games'] as const,
    detail: (id: string) => ['games', id] as const,
    active: ['games', 'active'] as const,
  },
  leaderboard: {
    all: ['leaderboard'] as const,
    byGame: (gameId: string, page?: number) => ['leaderboard', gameId, page] as const,
    global: (page?: number) => ['leaderboard', 'global', page] as const,
    friends: (userId: string) => ['leaderboard', 'friends', userId] as const,
  },
  playerMmr: {
    all: (playerId: string) => ['player-mmr', playerId] as const,
    byGame: (playerId: string, gameId: string) => ['player-mmr', playerId, gameId] as const,
    history: (playerId: string, gameId: string) => ['mmr-history', playerId, gameId] as const,
  },
  queue: {
    all: ['queue'] as const,
    byGame: (gameId: string) => ['queue', gameId] as const,
    myEntry: (gameId: string) => ['queue', 'me', gameId] as const,
  },
  matches: {
    all: ['matches'] as const,
    detail: (id: string) => ['matches', id] as const,
    history: (playerId: string) => ['matches', 'history', playerId] as const,
    active: (playerId: string) => ['matches', 'active', playerId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
  },
  friends: {
    all: (userId: string) => ['friends', userId] as const,
    requests: (userId: string) => ['friends', 'requests', userId] as const,
  },
  admin: {
    stats: ['admin', 'stats'] as const,
    users: (page?: number) => ['admin', 'users', page] as const,
    disputes: (status?: string) => ['admin', 'disputes', status] as const,
    bans: ['admin', 'bans'] as const,
  },
} as const;
