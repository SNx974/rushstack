-- ============================================================
-- RUSH STACK — Views, Functions & RLS
-- Migration: 002_views_and_functions
-- ============================================================

-- ─── Leaderboard View (per game) ─────────────────────────────────────────────

CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
  pm.player_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.country,
  pm.game_id,
  pm.mmr,
  pm.peak_mmr,
  pm.wins,
  pm.losses,
  pm.draws,
  CASE WHEN pm.wins + pm.losses = 0 THEN 0
       ELSE ROUND(pm.wins::NUMERIC / (pm.wins + pm.losses) * 100, 1)
  END AS win_rate,
  RANK() OVER (PARTITION BY pm.game_id ORDER BY pm.mmr DESC) AS rank_position,
  rt.name AS rank_tier_name,
  rt.color AS rank_tier_color,
  rt.icon_url AS rank_tier_icon
FROM player_mmr pm
JOIN profiles p ON p.id = pm.player_id
JOIN mmr_systems ms ON ms.id = pm.mmr_system_id AND ms.is_active = TRUE
LEFT JOIN rank_tiers rt ON rt.mmr_system_id = ms.id
  AND pm.mmr >= rt.min_mmr AND pm.mmr < rt.max_mmr
WHERE pm.is_placed = TRUE
  AND p.is_banned = FALSE;

-- ─── Global Leaderboard View ──────────────────────────────────────────────────

CREATE OR REPLACE VIEW global_leaderboard_view AS
SELECT
  lv.*,
  g.name AS game_name,
  g.slug AS game_slug,
  g.icon_url AS game_icon_url
FROM leaderboard_view lv
JOIN games g ON g.id = lv.game_id
WHERE g.is_active = TRUE;

-- ─── Function: Calculate ELO MMR Change ──────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_mmr_change(
  p_winner_mmr  INT,
  p_loser_mmr   INT,
  p_k_factor    NUMERIC DEFAULT 32,
  p_streak_bonus INT DEFAULT 0
)
RETURNS TABLE(winner_delta INT, loser_delta INT) AS $$
DECLARE
  expected_winner NUMERIC;
  expected_loser  NUMERIC;
  winner_gain     INT;
  loser_loss      INT;
BEGIN
  -- Standard ELO formula
  expected_winner := 1.0 / (1 + POWER(10, (p_loser_mmr - p_winner_mmr)::NUMERIC / 400));
  expected_loser  := 1.0 - expected_winner;

  winner_gain := ROUND(p_k_factor * (1 - expected_winner)) + p_streak_bonus;
  loser_loss  := ROUND(p_k_factor * expected_loser);

  -- Clamp to reasonable bounds
  winner_gain := GREATEST(1, LEAST(winner_gain, 100));
  loser_loss  := GREATEST(1, LEAST(loser_loss, 100));

  RETURN QUERY SELECT winner_gain, loser_loss;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── Function: Get player's current rank tier ─────────────────────────────────

CREATE OR REPLACE FUNCTION get_player_rank(
  p_player_id UUID,
  p_game_id   UUID,
  p_season_id UUID DEFAULT NULL
)
RETURNS SETOF rank_tiers AS $$
  SELECT rt.*
  FROM player_mmr pm
  JOIN mmr_systems ms ON ms.id = pm.mmr_system_id AND ms.is_active = TRUE
  JOIN rank_tiers rt ON rt.mmr_system_id = ms.id
    AND pm.mmr >= rt.min_mmr AND pm.mmr < rt.max_mmr
  WHERE pm.player_id = p_player_id
    AND pm.game_id = p_game_id
    AND (p_season_id IS NULL OR pm.season_id = p_season_id)
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- ─── Function: Process match result (atomic MMR update) ───────────────────────

CREATE OR REPLACE FUNCTION process_match_result(
  p_match_id     UUID,
  p_winning_team INT
)
RETURNS VOID AS $$
DECLARE
  v_match          matches%ROWTYPE;
  v_mmr_system     mmr_systems%ROWTYPE;
  v_winner         match_players%ROWTYPE;
  v_loser          match_players%ROWTYPE;
  v_winner_mmr     player_mmr%ROWTYPE;
  v_loser_mmr      player_mmr%ROWTYPE;
  v_winner_delta   INT;
  v_loser_delta    INT;
  v_streak_bonus   INT;
BEGIN
  -- Lock match row
  SELECT * INTO v_match FROM matches WHERE id = p_match_id FOR UPDATE;
  IF v_match.status != 'active' THEN
    RAISE EXCEPTION 'Match is not active';
  END IF;

  SELECT * INTO v_mmr_system FROM mmr_systems WHERE id = v_match.mmr_system_id;

  -- For 1v1: find winner and loser player rows
  SELECT * INTO v_winner FROM match_players
    WHERE match_id = p_match_id AND team = p_winning_team LIMIT 1;
  SELECT * INTO v_loser FROM match_players
    WHERE match_id = p_match_id AND team != p_winning_team LIMIT 1;

  -- Get current MMR rows
  SELECT * INTO v_winner_mmr FROM player_mmr
    WHERE player_id = v_winner.player_id AND game_id = v_match.game_id
    AND mmr_system_id = v_match.mmr_system_id FOR UPDATE;

  SELECT * INTO v_loser_mmr FROM player_mmr
    WHERE player_id = v_loser.player_id AND game_id = v_match.game_id
    AND mmr_system_id = v_match.mmr_system_id FOR UPDATE;

  -- Calculate streak bonus
  v_streak_bonus := 0;
  IF v_mmr_system.streak_bonus_enabled AND v_winner_mmr.win_streak >= v_mmr_system.streak_threshold THEN
    v_streak_bonus := v_mmr_system.streak_bonus_amount;
  END IF;

  -- Calculate deltas
  SELECT winner_delta, loser_delta INTO v_winner_delta, v_loser_delta
  FROM calculate_mmr_change(
    v_winner_mmr.mmr, v_loser_mmr.mmr,
    v_mmr_system.k_factor, v_streak_bonus
  );

  -- Apply placement match rules
  IF NOT v_winner_mmr.is_placed THEN
    v_winner_delta := v_winner_delta * 2; -- Double gain during placements
  END IF;
  IF NOT v_loser_mmr.is_placed THEN
    v_loser_delta := ROUND(v_loser_delta * 0.5); -- Half loss during placements
  END IF;

  -- Update winner MMR
  UPDATE player_mmr SET
    mmr = mmr + v_winner_delta,
    peak_mmr = GREATEST(peak_mmr, mmr + v_winner_delta),
    wins = wins + 1,
    win_streak = win_streak + 1,
    loss_streak = 0,
    placement_matches_played = CASE WHEN NOT is_placed THEN placement_matches_played + 1 ELSE placement_matches_played END,
    is_placed = CASE WHEN NOT is_placed AND placement_matches_played + 1 >= v_mmr_system.placement_matches THEN TRUE ELSE is_placed END,
    last_played_at = NOW(),
    updated_at = NOW()
  WHERE player_id = v_winner.player_id AND game_id = v_match.game_id AND mmr_system_id = v_match.mmr_system_id;

  -- Update loser MMR
  UPDATE player_mmr SET
    mmr = GREATEST(0, mmr - v_loser_delta),
    losses = losses + 1,
    win_streak = 0,
    loss_streak = loss_streak + 1,
    placement_matches_played = CASE WHEN NOT is_placed THEN placement_matches_played + 1 ELSE placement_matches_played END,
    is_placed = CASE WHEN NOT is_placed AND placement_matches_played + 1 >= v_mmr_system.placement_matches THEN TRUE ELSE is_placed END,
    last_played_at = NOW(),
    updated_at = NOW()
  WHERE player_id = v_loser.player_id AND game_id = v_match.game_id AND mmr_system_id = v_match.mmr_system_id;

  -- Update match_players with results
  UPDATE match_players SET is_winner = TRUE, mmr_delta = v_winner_delta WHERE match_id = p_match_id AND team = p_winning_team;
  UPDATE match_players SET is_winner = FALSE, mmr_delta = -v_loser_delta WHERE match_id = p_match_id AND team != p_winning_team;

  -- Record MMR history
  INSERT INTO mmr_history (player_id, game_id, mmr_system_id, season_id, match_id, mmr_before, mmr_after, reason)
  VALUES
    (v_winner.player_id, v_match.game_id, v_match.mmr_system_id, v_match.season_id, p_match_id,
     v_winner_mmr.mmr, v_winner_mmr.mmr + v_winner_delta, 'match_win'),
    (v_loser.player_id, v_match.game_id, v_match.mmr_system_id, v_match.season_id, p_match_id,
     v_loser_mmr.mmr, GREATEST(0, v_loser_mmr.mmr - v_loser_delta), 'match_loss');

  -- Complete match
  UPDATE matches SET status = 'completed', completed_at = NOW() WHERE id = p_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE mmr_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_mmr ENABLE ROW LEVEL SECURITY;
ALTER TABLE mmr_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bans ENABLE ROW LEVEL SECURITY;

-- Helper: check if caller is admin or above
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_moderator_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin', 'superadmin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: public read, own write
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE USING (is_admin());

-- Games: public read, admin write
CREATE POLICY "Games are publicly readable"
  ON games FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage games"
  ON games FOR ALL USING (is_admin());

-- MMR Systems / Rank Tiers: public read, admin write
CREATE POLICY "MMR systems public read"
  ON mmr_systems FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage MMR systems"
  ON mmr_systems FOR ALL USING (is_admin());

CREATE POLICY "Rank tiers public read"
  ON rank_tiers FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage rank tiers"
  ON rank_tiers FOR ALL USING (is_admin());

-- Player MMR: public read
CREATE POLICY "Player MMR public read"
  ON player_mmr FOR SELECT USING (TRUE);
CREATE POLICY "System can insert player_mmr"
  ON player_mmr FOR INSERT WITH CHECK (auth.uid() = player_id OR is_admin());

-- MMR History: read own + admins
CREATE POLICY "Players see own mmr history"
  ON mmr_history FOR SELECT USING (auth.uid() = player_id OR is_admin());

-- Queue: players manage own entry, admins see all
CREATE POLICY "Players manage own queue entry"
  ON queue_entries FOR ALL USING (auth.uid() = player_id);
CREATE POLICY "Admins see all queue entries"
  ON queue_entries FOR SELECT USING (is_moderator_or_above());

-- Matches: involved players + admins
CREATE POLICY "Match players and admins can read"
  ON matches FOR SELECT USING (
    is_moderator_or_above()
    OR EXISTS (SELECT 1 FROM match_players mp WHERE mp.match_id = id AND mp.player_id = auth.uid())
  );

CREATE POLICY "Match players read their rows"
  ON match_players FOR SELECT USING (
    player_id = auth.uid() OR is_moderator_or_above()
    OR EXISTS (SELECT 1 FROM match_players mp2 WHERE mp2.match_id = match_id AND mp2.player_id = auth.uid())
  );

-- Match results: involved players can submit
CREATE POLICY "Match players can submit results"
  ON match_results FOR INSERT WITH CHECK (
    auth.uid() = submitted_by
    AND EXISTS (SELECT 1 FROM match_players mp WHERE mp.match_id = match_id AND mp.player_id = auth.uid())
  );
CREATE POLICY "Match results readable by involved"
  ON match_results FOR SELECT USING (
    is_moderator_or_above()
    OR EXISTS (SELECT 1 FROM match_players mp WHERE mp.match_id = match_id AND mp.player_id = auth.uid())
  );

-- Disputes
CREATE POLICY "Players can open disputes for their matches"
  ON disputes FOR INSERT WITH CHECK (
    auth.uid() = opened_by
    AND EXISTS (SELECT 1 FROM match_players mp WHERE mp.match_id = match_id AND mp.player_id = auth.uid())
  );
CREATE POLICY "Involved players and mods read disputes"
  ON disputes FOR SELECT USING (
    is_moderator_or_above() OR opened_by = auth.uid()
  );
CREATE POLICY "Mods can update disputes"
  ON disputes FOR UPDATE USING (is_moderator_or_above());

-- Friendships
CREATE POLICY "Friends visible to involved users"
  ON friendships FOR SELECT USING (requester_id = auth.uid() OR addressee_id = auth.uid());
CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Addressee can accept/reject"
  ON friendships FOR UPDATE USING (addressee_id = auth.uid() OR requester_id = auth.uid());

-- Notifications: own only
CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT WITH CHECK (TRUE);

-- Leagues / Seasons: public read
CREATE POLICY "Leagues public read"
  ON leagues FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage leagues"
  ON leagues FOR ALL USING (is_admin());

CREATE POLICY "Seasons public read"
  ON seasons FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage seasons"
  ON seasons FOR ALL USING (is_admin());

-- Bans: admins only write, public read active bans
CREATE POLICY "Bans: admins can manage"
  ON bans FOR ALL USING (is_moderator_or_above());
CREATE POLICY "Bans: players see own bans"
  ON bans FOR SELECT USING (player_id = auth.uid());

-- ─── Realtime Publications ────────────────────────────────────────────────────

-- Enable realtime on tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE queue_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE match_players;
ALTER PUBLICATION supabase_realtime ADD TABLE match_results;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE player_mmr;
