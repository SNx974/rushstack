import { supabase } from '@/lib/supabase';
import type { LeaderboardFilter, PaginatedResult, LeaderboardEntry } from '@/types';

export async function fetchLeaderboard(filter: LeaderboardFilter): Promise<PaginatedResult<LeaderboardEntry>> {
  const { game_id, page, limit } = filter;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('leaderboard_view')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('rank_position');

  if (game_id) query = query.eq('game_id', game_id);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data ?? [],
    count: count ?? 0,
    page,
    limit,
    hasMore: (count ?? 0) > to + 1,
  };
}

export async function fetchFriendsLeaderboard(
  userId: string,
  gameId: string
): Promise<LeaderboardEntry[]> {
  // Get friend IDs first
  const { data: friends, error: friendsError } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq('status', 'accepted');
  if (friendsError) throw friendsError;

  const friendIds = friends.flatMap((f) => [
    f.requester_id === userId ? f.addressee_id : f.requester_id,
  ]);
  friendIds.push(userId); // Include self

  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .eq('game_id', gameId)
    .in('player_id', friendIds)
    .order('rank_position');
  if (error) throw error;
  return data ?? [];
}

export async function fetchPlayerRank(
  playerId: string,
  gameId: string
): Promise<LeaderboardEntry | null> {
  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .eq('game_id', gameId)
    .eq('player_id', playerId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
