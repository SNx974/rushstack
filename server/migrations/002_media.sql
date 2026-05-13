CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  url TEXT NOT NULL,
  section TEXT NOT NULL,
  label TEXT,
  alt TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sections prédéfinies commentées pour référence :
-- hero_background    : image de fond du hero
-- hero_character     : personnage/warrior du hero
-- hero_logo          : logo principal
-- game_valorant      : cover du jeu Valorant
-- game_cs2           : cover du jeu CS2
-- game_fortnite      : cover du jeu Fortnite
-- game_apex          : cover du jeu Apex Legends
-- game_cod           : cover du jeu Call of Duty
-- game_lol           : cover du jeu League of Legends
-- banner_cta         : image de fond du banner CTA
-- sidebar_bg         : fond de la sidebar
-- custom_*           : sections personnalisées libres
