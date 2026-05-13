// Auto-generated Supabase database types — keep in sync with migrations

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      games: {
        Row: Game;
        Insert: GameInsert;
        Update: GameUpdate;
      };
      mmr_systems: {
        Row: MmrSystem;
        Insert: MmrSystemInsert;
        Update: MmrSystemUpdate;
      };
      rank_tiers: {
        Row: RankTier;
        Insert: RankTierInsert;
        Update: RankTierUpdate;
      };
      player_mmr: {
        Row: PlayerMmr;
        Insert: PlayerMmrInsert;
        Update: PlayerMmrUpdate;
      };
      mmr_history: {
        Row: MmrHistory;
        Insert: MmrHistoryInsert;
        Update: MmrHistoryUpdate;
      };
      queue_entries: {
        Row: QueueEntry;
        Insert: QueueEntryInsert;
        Update: QueueEntryUpdate;
      };
      matches: {
        Row: Match;
        Insert: MatchInsert;
        Update: MatchUpdate;
      };
      match_players: {
        Row: MatchPlayer;
        Insert: MatchPlayerInsert;
        Update: MatchPlayerUpdate;
      };
      match_results: {
        Row: MatchResult;
        Insert: MatchResultInsert;
        Update: MatchResultUpdate;
      };
      disputes: {
        Row: Dispute;
        Insert: DisputeInsert;
        Update: DisputeUpdate;
      };
      friendships: {
        Row: Friendship;
        Insert: FriendshipInsert;
        Update: FriendshipUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      leagues: {
        Row: League;
        Insert: LeagueInsert;
        Update: LeagueUpdate;
      };
      seasons: {
        Row: Season;
        Insert: SeasonInsert;
        Update: SeasonUpdate;
      };
      bans: {
        Row: Ban;
        Insert: BanInsert;
        Update: BanUpdate;
      };
    };
    Views: {
      leaderboard_view: {
        Row: LeaderboardEntry;
      };
      global_leaderboard_view: {
        Row: GlobalLeaderboardEntry;
      };
    };
    Functions: {
      calculate_mmr_change: {
        Args: { winner_mmr: number; loser_mmr: number; system_id: string };
        Returns: { winner_delta: number; loser_delta: number };
      };
      get_player_rank: {
        Args: { p_player_id: string; p_game_id: string; p_season_id?: string };
        Returns: RankTier;
      };
    };
    Enums: {
      queue_status: 'searching' | 'found' | 'in_match' | 'cancelled';
      match_status: 'pending' | 'active' | 'completed' | 'cancelled' | 'disputed';
      result_status: 'pending' | 'confirmed' | 'disputed' | 'cancelled';
      friendship_status: 'pending' | 'accepted' | 'blocked';
      user_role: 'player' | 'moderator' | 'admin' | 'superadmin';
      notification_type:
        | 'match_found'
        | 'match_invite'
        | 'friend_request'
        | 'rank_up'
        | 'rank_down'
        | 'result_submitted'
        | 'dispute_opened'
        | 'dispute_resolved'
        | 'system';
      dispute_status: 'open' | 'under_review' | 'resolved' | 'closed';
      ban_type: 'temporary' | 'permanent';
    };
  };
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  country: string | null;
  role: Database['public']['Enums']['user_role'];
  is_verified: boolean;
  is_banned: boolean;
  discord_username: string | null;
  twitter_username: string | null;
  twitch_username: string | null;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<ProfileInsert>;

// ─── Game ─────────────────────────────────────────────────────────────────────

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  icon_url: string | null;
  banner_url: string | null;
  is_active: boolean;
  max_players_per_team: number;
  min_players_per_team: number;
  created_at: string;
  updated_at: string;
}
export type GameInsert = Omit<Game, 'id' | 'created_at' | 'updated_at'>;
export type GameUpdate = Partial<GameInsert>;

// ─── MMR System ───────────────────────────────────────────────────────────────

export interface MmrSystem {
  id: string;
  game_id: string;
  season_id: string | null;
  name: string;
  base_mmr: number;
  k_factor: number;
  placement_matches: number;
  decay_enabled: boolean;
  decay_days: number;
  decay_amount: number;
  streak_bonus_enabled: boolean;
  streak_bonus_amount: number;
  streak_threshold: number;
  hidden_mmr: boolean;
  is_active: boolean;
  created_at: string;
}
export type MmrSystemInsert = Omit<MmrSystem, 'id' | 'created_at'>;
export type MmrSystemUpdate = Partial<MmrSystemInsert>;

// ─── Rank Tier ────────────────────────────────────────────────────────────────

export interface RankTier {
  id: string;
  mmr_system_id: string;
  name: string;
  division: string | null;
  min_mmr: number;
  max_mmr: number;
  icon_url: string | null;
  color: string;
  order: number;
}
export type RankTierInsert = Omit<RankTier, 'id'>;
export type RankTierUpdate = Partial<RankTierInsert>;

// ─── Player MMR ───────────────────────────────────────────────────────────────

export interface PlayerMmr {
  id: string;
  player_id: string;
  game_id: string;
  mmr_system_id: string;
  season_id: string | null;
  mmr: number;
  peak_mmr: number;
  wins: number;
  losses: number;
  draws: number;
  win_streak: number;
  loss_streak: number;
  placement_matches_played: number;
  is_placed: boolean;
  last_played_at: string | null;
  created_at: string;
  updated_at: string;
}
export type PlayerMmrInsert = Omit<PlayerMmr, 'id' | 'created_at' | 'updated_at'>;
export type PlayerMmrUpdate = Partial<PlayerMmrInsert>;

// ─── MMR History ──────────────────────────────────────────────────────────────

export interface MmrHistory {
  id: string;
  player_id: string;
  game_id: string;
  mmr_system_id: string;
  season_id: string | null;
  match_id: string | null;
  mmr_before: number;
  mmr_after: number;
  delta: number;
  reason: string;
  created_at: string;
}
export type MmrHistoryInsert = Omit<MmrHistory, 'id' | 'created_at'>;
export type MmrHistoryUpdate = Partial<MmrHistoryInsert>;

// ─── Queue Entry ──────────────────────────────────────────────────────────────

export interface QueueEntry {
  id: string;
  player_id: string;
  game_id: string;
  mmr_system_id: string;
  status: Database['public']['Enums']['queue_status'];
  mmr_at_queue: number;
  match_id: string | null;
  joined_at: string;
  found_at: string | null;
  cancelled_at: string | null;
}
export type QueueEntryInsert = Omit<QueueEntry, 'id' | 'joined_at'>;
export type QueueEntryUpdate = Partial<QueueEntryInsert>;

// ─── Match ────────────────────────────────────────────────────────────────────

export interface Match {
  id: string;
  game_id: string;
  mmr_system_id: string;
  season_id: string | null;
  league_id: string | null;
  status: Database['public']['Enums']['match_status'];
  team_size: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}
export type MatchInsert = Omit<Match, 'id' | 'created_at'>;
export type MatchUpdate = Partial<MatchInsert>;

// ─── Match Player ─────────────────────────────────────────────────────────────

export interface MatchPlayer {
  id: string;
  match_id: string;
  player_id: string;
  team: number;
  mmr_at_match: number;
  mmr_delta: number | null;
  is_winner: boolean | null;
}
export type MatchPlayerInsert = Omit<MatchPlayer, 'id'>;
export type MatchPlayerUpdate = Partial<MatchPlayerInsert>;

// ─── Match Result ─────────────────────────────────────────────────────────────

export interface MatchResult {
  id: string;
  match_id: string;
  submitted_by: string;
  winning_team: number;
  screenshot_url: string | null;
  status: Database['public']['Enums']['result_status'];
  confirmation_count: number;
  created_at: string;
}
export type MatchResultInsert = Omit<MatchResult, 'id' | 'created_at'>;
export type MatchResultUpdate = Partial<MatchResultInsert>;

// ─── Dispute ──────────────────────────────────────────────────────────────────

export interface Dispute {
  id: string;
  match_id: string;
  opened_by: string;
  assigned_to: string | null;
  status: Database['public']['Enums']['dispute_status'];
  reason: string;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
}
export type DisputeInsert = Omit<Dispute, 'id' | 'created_at'>;
export type DisputeUpdate = Partial<DisputeInsert>;

// ─── Friendship ───────────────────────────────────────────────────────────────

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: Database['public']['Enums']['friendship_status'];
  created_at: string;
  updated_at: string;
}
export type FriendshipInsert = Omit<Friendship, 'id' | 'created_at' | 'updated_at'>;
export type FriendshipUpdate = Partial<FriendshipInsert>;

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  type: Database['public']['Enums']['notification_type'];
  title: string;
  body: string;
  data: Json | null;
  is_read: boolean;
  created_at: string;
}
export type NotificationInsert = Omit<Notification, 'id' | 'created_at'>;
export type NotificationUpdate = Partial<NotificationInsert>;

// ─── League ───────────────────────────────────────────────────────────────────

export interface League {
  id: string;
  game_id: string;
  season_id: string | null;
  name: string;
  description: string | null;
  is_ranked: boolean;
  is_active: boolean;
  max_participants: number | null;
  created_at: string;
}
export type LeagueInsert = Omit<League, 'id' | 'created_at'>;
export type LeagueUpdate = Partial<LeagueInsert>;

// ─── Season ───────────────────────────────────────────────────────────────────

export interface Season {
  id: string;
  game_id: string;
  name: string;
  number: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}
export type SeasonInsert = Omit<Season, 'id' | 'created_at'>;
export type SeasonUpdate = Partial<SeasonInsert>;

// ─── Ban ──────────────────────────────────────────────────────────────────────

export interface Ban {
  id: string;
  player_id: string;
  banned_by: string;
  type: Database['public']['Enums']['ban_type'];
  reason: string;
  expires_at: string | null;
  created_at: string;
}
export type BanInsert = Omit<Ban, 'id' | 'created_at'>;
export type BanUpdate = Partial<BanInsert>;

// ─── View types ───────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  player_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  country: string | null;
  mmr: number;
  peak_mmr: number;
  wins: number;
  losses: number;
  rank_position: number;
  rank_tier_name: string | null;
  rank_tier_color: string | null;
  rank_tier_icon: string | null;
}

export interface GlobalLeaderboardEntry extends LeaderboardEntry {
  game_name: string;
  game_id: string;
}
