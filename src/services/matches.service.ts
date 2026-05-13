import { supabase } from '@/lib/supabase';
import type { Match, MatchResult, MatchResultInsert, Dispute, DisputeInsert } from '@/types';

export async function fetchMatch(matchId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      game:games(*),
      match_players(
        *,
        profile:profiles(id, username, display_name, avatar_url, country)
      ),
      match_results(*)
    `)
    .eq('id', matchId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchPlayerMatchHistory(playerId: string, limit = 20) {
  const { data, error } = await supabase
    .from('match_players')
    .select(`
      *,
      match:matches(
        *,
        game:games(id, name, icon_url),
        match_players(
          player_id, team, mmr_at_match, mmr_delta, is_winner,
          profile:profiles(id, username, display_name, avatar_url)
        )
      )
    `)
    .eq('player_id', playerId)
    .order('created_at', { referencedTable: 'matches', ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function fetchActiveMatch(playerId: string): Promise<Match | null> {
  const { data, error } = await supabase
    .from('match_players')
    .select('match:matches(*)')
    .eq('player_id', playerId)
    .eq('matches.status', 'active')
    .maybeSingle();
  if (error) throw error;
  return (data?.match as unknown as Match) ?? null;
}

export async function submitMatchResult(result: Omit<MatchResultInsert, 'status' | 'confirmation_count'>): Promise<MatchResult> {
  const { data, error } = await supabase
    .from('match_results')
    .insert({ ...result, status: 'pending', confirmation_count: 1 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function confirmMatchResult(resultId: string): Promise<void> {
  // Increment confirmation count; trigger handles finalizing when count >= 2
  const { error } = await supabase.rpc('confirm_match_result', { p_result_id: resultId });
  if (error) throw error;
}

export async function uploadMatchScreenshot(matchId: string, uri: string): Promise<string> {
  const path = `screenshots/${matchId}/${Date.now()}.jpg`;
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('media')
    .upload(path, blob, { contentType: 'image/jpeg' });
  if (error) throw error;

  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}

export async function openDispute(dispute: Omit<DisputeInsert, 'status'>): Promise<Dispute> {
  // Mark match as disputed
  await supabase.from('matches').update({ status: 'disputed' }).eq('id', dispute.match_id);

  const { data, error } = await supabase
    .from('disputes')
    .insert({ ...dispute, status: 'open' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
