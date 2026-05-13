-- ============================================================
-- RUSH STACK — Initial Database Schema
-- Migration: 001_initial_schema
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- fuzzy search on usernames

-- ─── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE queue_status AS ENUM ('searching', 'found', 'in_match', 'cancelled');
CREATE TYPE match_status AS ENUM ('pending', 'active', 'completed', 'cancelled', 'disputed');
CREATE TYPE result_status AS ENUM ('pending', 'confirmed', 'disputed', 'cancelled');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE user_role AS ENUM ('player', 'moderator', 'admin', 'superadmin');
CREATE TYPE notification_type AS ENUM (
  'match_found', 'match_invite', 'friend_request', 'rank_up', 'rank_down',
  'result_submitted', 'dispute_opened', 'dispute_resolved', 'system'
);
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'closed');
CREATE TYPE ban_type AS ENUM ('temporary', 'permanent');

-- ─── Profiles ─────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT NOT NULL UNIQUE,
  display_name    TEXT,
  avatar_url      TEXT,
  banner_url      TEXT,
  bio             TEXT,
  country         CHAR(2), -- ISO 3166-1 alpha-2
  role            user_role NOT NULL DEFAULT 'player',
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  is_banned       BOOLEAN NOT NULL DEFAULT FALSE,
  discord_username TEXT,
  twitter_username TEXT,
  twitch_username  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ,
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 24),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

CREATE INDEX idx_profiles_username ON profiles USING gin(username gin_trgm_ops);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ─── Games ────────────────────────────────────────────────────────────────────

CREATE TABLE games (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,
  description           TEXT,
  cover_url             TEXT,
  icon_url              TEXT,
  banner_url            TEXT,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  max_players_per_team  INT NOT NULL DEFAULT 5,
  min_players_per_team  INT NOT NULL DEFAULT 1,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Seasons ──────────────────────────────────────────────────────────────────

CREATE TABLE seasons (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id    UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  number     INT NOT NULL,
  starts_at  TIMESTAMPTZ NOT NULL,
  ends_at    TIMESTAMPTZ NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT one_active_season_per_game UNIQUE NULLS NOT DISTINCT (game_id, is_active)
);

-- ─── MMR Systems ──────────────────────────────────────────────────────────────

CREATE TABLE mmr_systems (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id               UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  season_id             UUID REFERENCES seasons(id) ON DELETE SET NULL,
  name                  TEXT NOT NULL,
  base_mmr              INT NOT NULL DEFAULT 1000,
  k_factor              NUMERIC(8,2) NOT NULL DEFAULT 32,
  placement_matches     INT NOT NULL DEFAULT 10,
  decay_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
  decay_days            INT NOT NULL DEFAULT 30,
  decay_amount          INT NOT NULL DEFAULT 50,
  streak_bonus_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
  streak_bonus_amount   INT NOT NULL DEFAULT 10,
  streak_threshold      INT NOT NULL DEFAULT 3,
  hidden_mmr            BOOLEAN NOT NULL DEFAULT FALSE,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Rank Tiers ───────────────────────────────────────────────────────────────

CREATE TABLE rank_tiers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mmr_system_id UUID NOT NULL REFERENCES mmr_systems(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  division      TEXT,
  min_mmr       INT NOT NULL,
  max_mmr       INT NOT NULL,
  icon_url      TEXT,
  color         TEXT NOT NULL DEFAULT '#808080',
  "order"       INT NOT NULL,
  CONSTRAINT no_mmr_overlap UNIQUE (mmr_system_id, min_mmr)
);

-- ─── Player MMR ───────────────────────────────────────────────────────────────

CREATE TABLE player_mmr (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id                  UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  mmr_system_id            UUID NOT NULL REFERENCES mmr_systems(id) ON DELETE CASCADE,
  season_id                UUID REFERENCES seasons(id) ON DELETE SET NULL,
  mmr                      INT NOT NULL DEFAULT 1000,
  peak_mmr                 INT NOT NULL DEFAULT 1000,
  wins                     INT NOT NULL DEFAULT 0,
  losses                   INT NOT NULL DEFAULT 0,
  draws                    INT NOT NULL DEFAULT 0,
  win_streak               INT NOT NULL DEFAULT 0,
  loss_streak              INT NOT NULL DEFAULT 0,
  placement_matches_played INT NOT NULL DEFAULT 0,
  is_placed                BOOLEAN NOT NULL DEFAULT FALSE,
  last_played_at           TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_player_game_system UNIQUE (player_id, game_id, mmr_system_id, season_id)
);

CREATE INDEX idx_player_mmr_game ON player_mmr(game_id, mmr DESC);
CREATE INDEX idx_player_mmr_player ON player_mmr(player_id);

-- ─── MMR History ──────────────────────────────────────────────────────────────

CREATE TABLE mmr_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id       UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  mmr_system_id UUID NOT NULL REFERENCES mmr_systems(id) ON DELETE CASCADE,
  season_id     UUID REFERENCES seasons(id) ON DELETE SET NULL,
  match_id      UUID, -- FK added after matches table
  mmr_before    INT NOT NULL,
  mmr_after     INT NOT NULL,
  delta         INT NOT NULL GENERATED ALWAYS AS (mmr_after - mmr_before) STORED,
  reason        TEXT NOT NULL DEFAULT 'match',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mmr_history_player ON mmr_history(player_id, game_id, created_at DESC);

-- ─── Queue Entries ────────────────────────────────────────────────────────────

CREATE TABLE queue_entries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id       UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  mmr_system_id UUID NOT NULL REFERENCES mmr_systems(id) ON DELETE CASCADE,
  status        queue_status NOT NULL DEFAULT 'searching',
  mmr_at_queue  INT NOT NULL,
  match_id      UUID,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  found_at      TIMESTAMPTZ,
  cancelled_at  TIMESTAMPTZ,
  CONSTRAINT one_active_queue_per_player UNIQUE NULLS NOT DISTINCT (player_id, game_id)
  -- enforced at app level; DB unique partially not supported in old PG
);

CREATE INDEX idx_queue_entries_game_status ON queue_entries(game_id, status, joined_at);
CREATE INDEX idx_queue_entries_player ON queue_entries(player_id);

-- ─── Matches ──────────────────────────────────────────────────────────────────

CREATE TABLE matches (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id       UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  mmr_system_id UUID NOT NULL REFERENCES mmr_systems(id) ON DELETE CASCADE,
  season_id     UUID REFERENCES seasons(id) ON DELETE SET NULL,
  league_id     UUID, -- FK added after leagues table
  status        match_status NOT NULL DEFAULT 'pending',
  team_size     INT NOT NULL DEFAULT 1,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_matches_game_status ON matches(game_id, status, created_at DESC);

-- Add FK from mmr_history to matches now that matches exists
ALTER TABLE mmr_history ADD CONSTRAINT fk_mmr_history_match
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL;

-- Add FK from queue_entries to matches
ALTER TABLE queue_entries ADD CONSTRAINT fk_queue_match
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL;

-- ─── Match Players ────────────────────────────────────────────────────────────

CREATE TABLE match_players (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id     UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team         INT NOT NULL DEFAULT 1,
  mmr_at_match INT NOT NULL,
  mmr_delta    INT,
  is_winner    BOOLEAN,
  CONSTRAINT unique_player_per_match UNIQUE (match_id, player_id)
);

CREATE INDEX idx_match_players_match ON match_players(match_id);
CREATE INDEX idx_match_players_player ON match_players(player_id);

-- ─── Match Results ────────────────────────────────────────────────────────────

CREATE TABLE match_results (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id           UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  submitted_by       UUID NOT NULL REFERENCES profiles(id),
  winning_team       INT NOT NULL,
  screenshot_url     TEXT,
  status             result_status NOT NULL DEFAULT 'pending',
  confirmation_count INT NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Disputes ─────────────────────────────────────────────────────────────────

CREATE TABLE disputes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  opened_by   UUID NOT NULL REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  status      dispute_status NOT NULL DEFAULT 'open',
  reason      TEXT NOT NULL,
  resolution  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_disputes_status ON disputes(status);

-- ─── Leagues ──────────────────────────────────────────────────────────────────

CREATE TABLE leagues (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id          UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  season_id        UUID REFERENCES seasons(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  description      TEXT,
  is_ranked        BOOLEAN NOT NULL DEFAULT TRUE,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  max_participants INT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK from matches to leagues
ALTER TABLE matches ADD CONSTRAINT fk_matches_league
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE SET NULL;

-- ─── Friendships ──────────────────────────────────────────────────────────────

CREATE TABLE friendships (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       friendship_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_friend CHECK (requester_id != addressee_id),
  CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id)
);

CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);

-- ─── Notifications ────────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  data       JSONB,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ─── Bans ─────────────────────────────────────────────────────────────────────

CREATE TABLE bans (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  banned_by  UUID NOT NULL REFERENCES profiles(id),
  type       ban_type NOT NULL DEFAULT 'temporary',
  reason     TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Triggers ─────────────────────────────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER player_mmr_updated_at BEFORE UPDATE ON player_mmr
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER friendships_updated_at BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'player_' || substr(NEW.id::TEXT, 1, 8)),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update is_banned on profiles when a ban is inserted
CREATE OR REPLACE FUNCTION sync_ban_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET is_banned = TRUE WHERE id = NEW.player_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ban_created
  AFTER INSERT ON bans
  FOR EACH ROW EXECUTE FUNCTION sync_ban_to_profile();
