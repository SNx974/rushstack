export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'player' | 'moderator' | 'admin'
export type MatchStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
export type QueueStatus = 'searching' | 'found' | 'cancelled'
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed'
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'
export type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster' | 'challenger'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: UserRole
  is_banned: boolean
  ban_reason: string | null
  ban_expires_at: string | null
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  name: string
  slug: string
  icon_url: string | null
  cover_url: string | null
  is_active: boolean
  created_at: string
}

export interface PlayerMmr {
  id: string
  player_id: string
  game_id: string
  mmr: number
  rank_tier: RankTier
  wins: number
  losses: number
  draws: number
  win_streak: number
  loss_streak: number
  peak_mmr: number
  season_id: string | null
  updated_at: string
}

export interface Match {
  id: string
  game_id: string
  status: MatchStatus
  mmr_system_id: string
  server_region: string | null
  created_at: string
  started_at: string | null
  ended_at: string | null
}

export interface LeaderboardEntry {
  rank: number
  player_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  mmr: number
  rank_tier: RankTier
  wins: number
  losses: number
  win_rate: number
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  is_read: boolean
  data: Json | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      games: { Row: Game; Insert: Partial<Game>; Update: Partial<Game> }
      player_mmr: { Row: PlayerMmr; Insert: Partial<PlayerMmr>; Update: Partial<PlayerMmr> }
      matches: { Row: Match; Insert: Partial<Match>; Update: Partial<Match> }
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> }
    }
    Views: {
      leaderboard_view: { Row: LeaderboardEntry }
    }
    Functions: Record<string, unknown>
    Enums: {
      user_role: UserRole
      match_status: MatchStatus
      rank_tier: RankTier
    }
  }
}
