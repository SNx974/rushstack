import { supabase } from '@/lib/supabase';
import type { Profile, Ban, Dispute, AdminStats, Game, MmrSystem, RankTier } from '@/types';

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function fetchAdminStats(): Promise<AdminStats> {
  const [usersResult, todayMatchesResult, queueResult, disputesResult, bansResult] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
    supabase.from('queue_entries').select('*', { count: 'exact', head: true }).eq('status', 'searching'),
    supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('bans').select('*', { count: 'exact', head: true })
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString()),
  ]);

  return {
    total_users: usersResult.count ?? 0,
    active_users_today: 0,
    matches_today: todayMatchesResult.count ?? 0,
    active_queues: queueResult.count ?? 0,
    open_disputes: disputesResult.count ?? 0,
    active_bans: bansResult.count ?? 0,
  };
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function fetchAllUsers(page = 1, limit = 20, search?: string) {
  let query = supabase.from('profiles').select('*', { count: 'exact' });
  if (search) query = query.ilike('username', `%${search}%`);
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('created_at', { ascending: false });
  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function banUser(playerId: string, bannedBy: string, reason: string, expiresAt?: string): Promise<void> {
  const { error } = await supabase.from('bans').insert({
    player_id: playerId,
    banned_by: bannedBy,
    type: expiresAt ? 'temporary' : 'permanent',
    reason,
    expires_at: expiresAt ?? null,
  });
  if (error) throw error;
}

export async function unbanUser(playerId: string): Promise<void> {
  const { error: banError } = await supabase.from('bans').delete().eq('player_id', playerId);
  const { error: profileError } = await supabase.from('profiles').update({ is_banned: false }).eq('id', playerId);
  if (banError) throw banError;
  if (profileError) throw profileError;
}

export async function updateUserRole(userId: string, role: Profile['role']): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
  if (error) throw error;
}

export async function resetUserMmr(playerId: string, gameId: string, baseMMR: number): Promise<void> {
  const { error } = await supabase
    .from('player_mmr')
    .update({ mmr: baseMMR, wins: 0, losses: 0, win_streak: 0, loss_streak: 0, is_placed: false, placement_matches_played: 0 })
    .eq('player_id', playerId)
    .eq('game_id', gameId);
  if (error) throw error;
}

// ─── Disputes ─────────────────────────────────────────────────────────────────

export async function fetchAllDisputes(status?: string) {
  let query = supabase.from('disputes').select(`
    *, opener:profiles!disputes_opened_by_fkey(id, username, avatar_url),
    assignee:profiles!disputes_assigned_to_fkey(id, username),
    match:matches(id, game:games(name))
  `).order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function resolveDispute(
  disputeId: string, adminId: string, resolution: string, cancelMatch = false
): Promise<void> {
  const { data: dispute, error: dErr } = await supabase
    .from('disputes').select('match_id').eq('id', disputeId).single();
  if (dErr) throw dErr;

  await supabase.from('disputes').update({
    status: 'resolved', resolution, assigned_to: adminId, resolved_at: new Date().toISOString(),
  }).eq('id', disputeId);

  if (cancelMatch && dispute?.match_id) {
    await supabase.from('matches').update({ status: 'cancelled' }).eq('id', dispute.match_id);
  }
}

// ─── Game Management ──────────────────────────────────────────────────────────

export async function createGame(game: Omit<Game, 'id' | 'created_at' | 'updated_at'>): Promise<Game> {
  const { data, error } = await supabase.from('games').insert(game).select().single();
  if (error) throw error;
  return data;
}

export async function updateGame(gameId: string, updates: Partial<Game>): Promise<Game> {
  const { data, error } = await supabase.from('games').update(updates).eq('id', gameId).select().single();
  if (error) throw error;
  return data;
}

export async function createMmrSystem(system: Omit<MmrSystem, 'id' | 'created_at'>): Promise<MmrSystem> {
  const { data, error } = await supabase.from('mmr_systems').insert(system).select().single();
  if (error) throw error;
  return data;
}

export async function createRankTier(tier: Omit<RankTier, 'id'>): Promise<RankTier> {
  const { data, error } = await supabase.from('rank_tiers').insert(tier).select().single();
  if (error) throw error;
  return data;
}

export async function cancelMatch(matchId: string): Promise<void> {
  const { error } = await supabase.from('matches').update({ status: 'cancelled' }).eq('id', matchId);
  if (error) throw error;
}
