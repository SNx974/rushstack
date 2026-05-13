import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const queryKeys = {
  profile: (id: string) => ['profile', id] as const,
  leaderboard: (gameId?: string) => ['leaderboard', gameId] as const,
  matches: (userId: string) => ['matches', userId] as const,
  friends: (userId: string) => ['friends', userId] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
  queue: (userId: string) => ['queue', userId] as const,
  adminStats: () => ['admin', 'stats'] as const,
  games: () => ['games'] as const,
}
