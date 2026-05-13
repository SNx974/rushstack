// Application-level types (UI state, composed views, etc.)

import type { Profile, Game, PlayerMmr, RankTier, Match, QueueEntry } from './database.types';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Composed profile view ────────────────────────────────────────────────────

export interface PlayerProfile extends Profile {
  stats: PlayerStats[];
  recent_matches: MatchWithDetails[];
  current_ranks: PlayerRankView[];
}

export interface PlayerStats {
  game_id: string;
  game_name: string;
  mmr: number;
  wins: number;
  losses: number;
  win_rate: number;
  peak_mmr: number;
  rank_tier: RankTier | null;
}

export interface PlayerRankView {
  game: Game;
  player_mmr: PlayerMmr;
  rank_tier: RankTier | null;
  rank_position: number | null;
}

// ─── Match with details ───────────────────────────────────────────────────────

export interface MatchWithDetails extends Match {
  game: Game;
  players: MatchPlayerWithProfile[];
  result: MatchResultView | null;
}

export interface MatchPlayerWithProfile {
  player_id: string;
  profile: Profile;
  team: number;
  mmr_at_match: number;
  mmr_delta: number | null;
  is_winner: boolean | null;
}

export interface MatchResultView {
  winning_team: number;
  screenshot_url: string | null;
  status: string;
}

// ─── Queue ────────────────────────────────────────────────────────────────────

export interface QueueEntryWithProfile extends QueueEntry {
  profile: Profile;
  rank_tier: RankTier | null;
}

export interface QueueState {
  entries: QueueEntryWithProfile[];
  myEntry: QueueEntry | null;
  isSearching: boolean;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardFilter {
  game_id?: string;
  season_id?: string;
  region?: string;
  type: 'global' | 'game' | 'friends';
  page: number;
  limit: number;
}

// ─── Notification with action ─────────────────────────────────────────────────

export interface NotificationWithAction {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export type UserRole = 'player' | 'moderator' | 'admin' | 'superadmin';

export interface AdminStats {
  total_users: number;
  active_users_today: number;
  matches_today: number;
  active_queues: number;
  open_disputes: number;
  active_bans: number;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
