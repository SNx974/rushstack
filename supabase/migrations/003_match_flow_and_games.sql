-- ============================================================
-- 003 — Match Flow & Game Configuration
-- ============================================================

-- ── GAME MAPS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS game_maps (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id      UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  active       BOOLEAN NOT NULL DEFAULT true,
  order_index  INT  NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── GAME FORMATS (BO1, BO3, BO5…) ─────────────────────────
CREATE TABLE IF NOT EXISTS game_formats (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id    UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,          -- 'BO1' | 'BO3' | 'BO5' | custom
  active     BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── GAME MODE SLOTS (ex: CoD slot 1=HP slot 2=R&D …) ──────
CREATE TABLE IF NOT EXISTS game_mode_slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id     UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  slot_index  INT  NOT NULL,         -- 1, 2, 3 …
  mode_name   TEXT NOT NULL,         -- 'HARDPOINT', 'SEARCH & DESTROY' …
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_id, slot_index)
);

-- ── GAME CUSTOM RULES (clé/valeur libres) ─────────────────
CREATE TABLE IF NOT EXISTS game_custom_rules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id    UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL DEFAULT '',
  value_type TEXT NOT NULL DEFAULT 'text',  -- 'text' | 'number' | 'boolean'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_id, key)
);

-- ── MATCHES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS match_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id      UUID REFERENCES games(id),
  stage        TEXT NOT NULL DEFAULT 'lobby',
    -- 'lobby' | 'mapban' | 'ingame' | 'report' | 'confirm' | 'done'
  picked_map   TEXT,
  lobby_code   TEXT,
  host_id      UUID REFERENCES profiles(id),
  winner_team  TEXT,  -- 'A' | 'B'
  conflict     BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── MATCH PLAYERS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS match_players (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   UUID NOT NULL REFERENCES match_sessions(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id),
  team       TEXT NOT NULL,   -- 'A' | 'B'
  is_captain BOOLEAN NOT NULL DEFAULT false,
  mmr_before INT  NOT NULL DEFAULT 0,
  mmr_after  INT,
  seed       INT  NOT NULL DEFAULT 0,
  UNIQUE (match_id, user_id)
);

-- ── MAP BANS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS match_map_bans (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id       UUID NOT NULL REFERENCES match_sessions(id) ON DELETE CASCADE,
  map_id         TEXT NOT NULL,
  banned_by_team TEXT NOT NULL,   -- 'A' | 'B'
  order_index    INT  NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── REPORTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS match_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id     UUID NOT NULL REFERENCES match_sessions(id) ON DELETE CASCADE,
  team         TEXT NOT NULL,      -- 'A' | 'B'
  result       TEXT NOT NULL,      -- 'win' | 'loss'
  reported_by  UUID REFERENCES profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (match_id, team)
);

-- ── MATCH CHAT ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS match_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID NOT NULL REFERENCES match_sessions(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id),
  author_name TEXT NOT NULL,
  text        TEXT NOT NULL,
  scope       TEXT NOT NULL DEFAULT 'global',  -- 'team' | 'global'
  team        TEXT NOT NULL,                   -- 'A' | 'B'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TRIGGERS ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_match_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_match_updated_at ON match_sessions;
CREATE TRIGGER trg_match_updated_at
  BEFORE UPDATE ON match_sessions
  FOR EACH ROW EXECUTE FUNCTION update_match_updated_at();

-- ── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_match_players_user   ON match_players(user_id);
CREATE INDEX IF NOT EXISTS idx_match_players_match  ON match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_messages_match ON match_messages(match_id, created_at);
CREATE INDEX IF NOT EXISTS idx_game_maps_game        ON game_maps(game_id, order_index);
CREATE INDEX IF NOT EXISTS idx_game_formats_game     ON game_formats(game_id);

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE game_maps          ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_formats       ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_mode_slots    ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_custom_rules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players      ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_map_bans     ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_reports      ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_messages     ENABLE ROW LEVEL SECURITY;

-- Public reads on game config
CREATE POLICY "game_maps_read"         ON game_maps         FOR SELECT USING (true);
CREATE POLICY "game_formats_read"      ON game_formats      FOR SELECT USING (true);
CREATE POLICY "game_mode_slots_read"   ON game_mode_slots   FOR SELECT USING (true);
CREATE POLICY "game_custom_rules_read" ON game_custom_rules FOR SELECT USING (true);

-- Admin writes on game config
CREATE POLICY "game_maps_admin"         ON game_maps         FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','moderator')));
CREATE POLICY "game_formats_admin"      ON game_formats      FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','moderator')));
CREATE POLICY "game_mode_slots_admin"   ON game_mode_slots   FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','moderator')));
CREATE POLICY "game_custom_rules_admin" ON game_custom_rules FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','moderator')));

-- Match sessions: players can read their own matches
CREATE POLICY "match_sessions_read" ON match_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM match_players WHERE match_id = match_sessions.id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);
CREATE POLICY "match_sessions_insert" ON match_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "match_sessions_update" ON match_sessions FOR UPDATE USING (true);

CREATE POLICY "match_players_read"   ON match_players FOR SELECT USING (true);
CREATE POLICY "match_players_insert" ON match_players FOR INSERT WITH CHECK (true);
CREATE POLICY "match_players_update" ON match_players FOR UPDATE USING (true);

CREATE POLICY "match_map_bans_read"   ON match_map_bans FOR SELECT USING (true);
CREATE POLICY "match_map_bans_insert" ON match_map_bans FOR INSERT WITH CHECK (true);

CREATE POLICY "match_reports_read"   ON match_reports FOR SELECT USING (true);
CREATE POLICY "match_reports_insert" ON match_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "match_messages_read"   ON match_messages FOR SELECT USING (true);
CREATE POLICY "match_messages_insert" ON match_messages FOR INSERT WITH CHECK (true);

-- ── SEED DEFAULT GAME CONFIG ───────────────────────────────
-- Maps Valorant (si le jeu 'valorant' existe déjà dans games)
INSERT INTO game_maps (game_id, name, active, order_index)
SELECT g.id, m.name, true, m.ord FROM games g
JOIN (VALUES
  ('Ascent',1),('Bind',2),('Haven',3),('Split',4),
  ('Icebox',5),('Breeze',6),('Fracture',7),('Lotus',8),('Pearl',9)
) AS m(name, ord) ON g.slug = 'valorant'
ON CONFLICT DO NOTHING;

-- Formats Valorant
INSERT INTO game_formats (game_id, type, active)
SELECT g.id, f.type, f.active FROM games g
JOIN (VALUES ('BO1', false), ('BO3', true)) AS f(type, active) ON g.slug = 'valorant'
ON CONFLICT DO NOTHING;

-- CoD maps + format + mode slots
INSERT INTO game_maps (game_id, name, active, order_index)
SELECT g.id, m.name, true, m.ord FROM games g
JOIN (VALUES ('Skidrow',1),('Scrapyard',2),('Terminal',3),('Rust',4),('Highrise',5)) AS m(name, ord)
ON g.slug IN ('cod','call-of-duty')
ON CONFLICT DO NOTHING;

INSERT INTO game_formats (game_id, type, active)
SELECT g.id, 'BO3', true FROM games g WHERE g.slug IN ('cod','call-of-duty')
ON CONFLICT DO NOTHING;

INSERT INTO game_mode_slots (game_id, slot_index, mode_name, description)
SELECT g.id, s.slot, s.mode, s.desc FROM games g
JOIN (VALUES
  (1,'HARDPOINT','HP — Tenir la position 250 pts'),
  (2,'SEARCH & DESTROY','R&D — Éliminer ou désamorcer la bombe'),
  (3,'SURCHARGE','Control — Capturer et tenir 2 zones')
) AS s(slot, mode, desc) ON g.slug IN ('cod','call-of-duty')
ON CONFLICT DO NOTHING;
