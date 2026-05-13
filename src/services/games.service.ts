import { supabase } from '@/lib/supabase';
import type { Game, MmrSystem, RankTier, Season, League } from '@/types';

export async function fetchActiveGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return data;
}

export async function fetchGame(gameId: string): Promise<Game> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchGameMmrSystem(gameId: string): Promise<MmrSystem> {
  const { data, error } = await supabase
    .from('mmr_systems')
    .select('*')
    .eq('game_id', gameId)
    .eq('is_active', true)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchRankTiers(mmrSystemId: string): Promise<RankTier[]> {
  const { data, error } = await supabase
    .from('rank_tiers')
    .select('*')
    .eq('mmr_system_id', mmrSystemId)
    .order('order');
  if (error) throw error;
  return data;
}

export async function fetchActiveSeason(gameId: string): Promise<Season | null> {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('game_id', gameId)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchLeagues(gameId: string): Promise<League[]> {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('game_id', gameId)
    .eq('is_active', true);
  if (error) throw error;
  return data;
}
