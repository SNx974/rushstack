import { supabase } from '@/lib/supabase';
import type { QueueEntry, QueueEntryInsert, Match } from '@/types';

export async function joinQueue(entry: Omit<QueueEntryInsert, 'status'>): Promise<QueueEntry> {
  // Cancel any existing entry for this game first
  await supabase
    .from('queue_entries')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('player_id', entry.player_id)
    .eq('game_id', entry.game_id)
    .eq('status', 'searching');

  const { data, error } = await supabase
    .from('queue_entries')
    .insert({ ...entry, status: 'searching' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function leaveQueue(playerId: string, gameId: string): Promise<void> {
  const { error } = await supabase
    .from('queue_entries')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('player_id', playerId)
    .eq('game_id', gameId)
    .eq('status', 'searching');
  if (error) throw error;
}

export async function getMyQueueEntry(playerId: string, gameId: string): Promise<QueueEntry | null> {
  const { data, error } = await supabase
    .from('queue_entries')
    .select('*')
    .eq('player_id', playerId)
    .eq('game_id', gameId)
    .in('status', ['searching', 'found'])
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getQueueForGame(gameId: string): Promise<QueueEntry[]> {
  const { data, error } = await supabase
    .from('queue_entries')
    .select('*')
    .eq('game_id', gameId)
    .eq('status', 'searching')
    .order('joined_at');
  if (error) throw error;
  return data ?? [];
}

// Matchmaking: pair the two closest MMR players in queue
// Called server-side via Edge Function in production; exposed here for local dev
export async function attemptMatchmaking(gameId: string): Promise<Match | null> {
  const queue = await getQueueForGame(gameId);
  if (queue.length < 2) return null;

  // Sort by MMR and take first two (closest match)
  const [p1, p2] = queue.sort((a, b) => a.mmr_at_queue - b.mmr_at_queue);

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({
      game_id: gameId,
      mmr_system_id: p1.mmr_system_id,
      status: 'active',
      team_size: 1,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (matchError) throw matchError;

  await supabase.from('match_players').insert([
    { match_id: match.id, player_id: p1.player_id, team: 1, mmr_at_match: p1.mmr_at_queue },
    { match_id: match.id, player_id: p2.player_id, team: 2, mmr_at_match: p2.mmr_at_queue },
  ]);

  // Update queue status
  await supabase
    .from('queue_entries')
    .update({ status: 'in_match', match_id: match.id, found_at: new Date().toISOString() })
    .in('id', [p1.id, p2.id]);

  return match;
}
