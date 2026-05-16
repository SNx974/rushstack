import { api } from '@/lib/api'

export interface GameMap {
  id: string
  game_id: string
  name: string
  active: boolean
  order_index: number
}

export interface GameFormat {
  id: string
  game_id: string
  type: string
  active: boolean
}

export interface GameModeSlot {
  id: string
  game_id: string
  slot_index: number
  mode_name: string
  description: string
}

export interface GameCustomRule {
  id: string
  game_id: string
  key: string
  value: string
  value_type: 'text' | 'number' | 'boolean'
}

export interface Game {
  id: string
  name: string
  slug: string
  logo_url: string | null
  active: boolean
  maps?: GameMap[]
  formats?: GameFormat[]
  mode_slots?: GameModeSlot[]
  custom_rules?: GameCustomRule[]
}

/* ── Games CRUD ──────────────────────────────────────────── */

export async function getGames(): Promise<Game[]> {
  try {
    return await api.get<Game[]>('/games')
  } catch {
    return FALLBACK_GAMES
  }
}

export async function getGameConfig(gameId: string): Promise<Game> {
  try {
    return await api.get<Game>(`/games/${gameId}/config`)
  } catch {
    return FALLBACK_GAMES.find(g => g.id === gameId) ?? FALLBACK_GAMES[0]
  }
}

export async function createGame(data: { name: string; slug: string; logo_url?: string }): Promise<Game> {
  return api.post<Game>('/games', data)
}

export async function updateGame(gameId: string, data: Partial<Game>): Promise<Game> {
  return api.patch<Game>(`/games/${gameId}`, data)
}

export async function toggleGame(gameId: string, active: boolean): Promise<Game> {
  return api.patch<Game>(`/games/${gameId}`, { active })
}

/* ── Maps ────────────────────────────────────────────────── */

export async function addMap(gameId: string, name: string, order_index: number): Promise<GameMap> {
  return api.post<GameMap>(`/games/${gameId}/maps`, { name, order_index })
}

export async function updateMap(gameId: string, mapId: string, data: Partial<GameMap>): Promise<GameMap> {
  return api.patch<GameMap>(`/games/${gameId}/maps/${mapId}`, data)
}

export async function deleteMap(gameId: string, mapId: string): Promise<void> {
  return api.delete<void>(`/games/${gameId}/maps/${mapId}`)
}

/* ── Formats ─────────────────────────────────────────────── */

export async function setFormat(gameId: string, type: string, active: boolean): Promise<GameFormat> {
  return api.post<GameFormat>(`/games/${gameId}/formats`, { type, active })
}

export async function updateFormat(gameId: string, formatId: string, active: boolean): Promise<GameFormat> {
  return api.patch<GameFormat>(`/games/${gameId}/formats/${formatId}`, { active })
}

/* ── Mode slots ──────────────────────────────────────────── */

export async function setModeSlots(gameId: string, slots: { slot_index: number; mode_name: string; description: string }[]): Promise<GameModeSlot[]> {
  return api.post<GameModeSlot[]>(`/games/${gameId}/mode-slots`, { slots })
}

export async function updateModeSlot(gameId: string, slotId: string, data: Partial<GameModeSlot>): Promise<GameModeSlot> {
  return api.patch<GameModeSlot>(`/games/${gameId}/mode-slots/${slotId}`, data)
}

/* ── Custom rules ────────────────────────────────────────── */

export async function setCustomRule(gameId: string, key: string, value: string, value_type: string): Promise<GameCustomRule> {
  return api.post<GameCustomRule>(`/games/${gameId}/rules`, { key, value, value_type })
}

export async function deleteCustomRule(gameId: string, ruleId: string): Promise<void> {
  return api.delete<void>(`/games/${gameId}/rules/${ruleId}`)
}

/* ── Fallback (si API non dispo) ─────────────────────────── */

export const FALLBACK_GAMES: Game[] = [
  {
    id: 'valorant',
    name: 'VALORANT',
    slug: 'valorant',
    logo_url: null,
    active: true,
    maps: [
      { id: 'ascent',   game_id: 'valorant', name: 'Ascent',   active: true, order_index: 1 },
      { id: 'bind',     game_id: 'valorant', name: 'Bind',     active: true, order_index: 2 },
      { id: 'haven',    game_id: 'valorant', name: 'Haven',    active: true, order_index: 3 },
      { id: 'split',    game_id: 'valorant', name: 'Split',    active: true, order_index: 4 },
      { id: 'icebox',   game_id: 'valorant', name: 'Icebox',   active: true, order_index: 5 },
      { id: 'breeze',   game_id: 'valorant', name: 'Breeze',   active: true, order_index: 6 },
      { id: 'fracture', game_id: 'valorant', name: 'Fracture', active: true, order_index: 7 },
      { id: 'lotus',    game_id: 'valorant', name: 'Lotus',    active: true, order_index: 8 },
      { id: 'pearl',    game_id: 'valorant', name: 'Pearl',    active: true, order_index: 9 },
    ],
    formats: [
      { id: 'v-bo1', game_id: 'valorant', type: 'BO1', active: false },
      { id: 'v-bo3', game_id: 'valorant', type: 'BO3', active: true },
    ],
    mode_slots: [],
    custom_rules: [
      { id: 'r1', game_id: 'valorant', key: 'ban_count', value: '8', value_type: 'number' },
    ],
  },
  {
    id: 'cod',
    name: 'CALL OF DUTY',
    slug: 'cod',
    logo_url: null,
    active: true,
    maps: [
      { id: 'skidrow',   game_id: 'cod', name: 'Skidrow',   active: true, order_index: 1 },
      { id: 'scrapyard', game_id: 'cod', name: 'Scrapyard', active: true, order_index: 2 },
      { id: 'terminal',  game_id: 'cod', name: 'Terminal',  active: true, order_index: 3 },
      { id: 'rust',      game_id: 'cod', name: 'Rust',      active: true, order_index: 4 },
      { id: 'highrise',  game_id: 'cod', name: 'Highrise',  active: true, order_index: 5 },
    ],
    formats: [
      { id: 'c-bo3', game_id: 'cod', type: 'BO3', active: true },
    ],
    mode_slots: [
      { id: 'cs1', game_id: 'cod', slot_index: 1, mode_name: 'HARDPOINT',         description: 'HP — Tenir la position 250 pts' },
      { id: 'cs2', game_id: 'cod', slot_index: 2, mode_name: 'SEARCH & DESTROY',  description: 'R&D — Éliminer ou désamorcer la bombe' },
      { id: 'cs3', game_id: 'cod', slot_index: 3, mode_name: 'SURCHARGE',         description: 'Control — Capturer et tenir 2 zones' },
    ],
    custom_rules: [],
  },
  {
    id: 'lol',
    name: 'LEAGUE OF LEGENDS',
    slug: 'lol',
    logo_url: null,
    active: true,
    maps: [
      { id: 'faille', game_id: 'lol', name: "Faille de l'invocateur", active: true, order_index: 1 },
    ],
    formats: [
      { id: 'l-bo1', game_id: 'lol', type: 'BO1', active: true },
      { id: 'l-bo3', game_id: 'lol', type: 'BO3', active: false },
    ],
    mode_slots: [],
    custom_rules: [],
  },
  {
    id: 'apex',
    name: 'APEX LEGENDS',
    slug: 'apex',
    logo_url: null,
    active: true,
    maps: [
      { id: 'storm-point',    game_id: 'apex', name: 'Storm Point',     active: true, order_index: 1 },
      { id: 'worlds-edge',    game_id: 'apex', name: "World's Edge",    active: true, order_index: 2 },
      { id: 'kings-canyon',   game_id: 'apex', name: "King's Canyon",   active: true, order_index: 3 },
      { id: 'olympus',        game_id: 'apex', name: 'Olympus',         active: true, order_index: 4 },
    ],
    formats: [
      { id: 'a-custom', game_id: 'apex', type: 'Custom', active: true },
    ],
    mode_slots: [],
    custom_rules: [],
  },
  {
    id: 'fortnite',
    name: 'FORTNITE',
    slug: 'fortnite',
    logo_url: null,
    active: true,
    maps: [
      { id: 'battle-royale', game_id: 'fortnite', name: 'Battle Royale', active: true, order_index: 1 },
    ],
    formats: [
      { id: 'f-arena', game_id: 'fortnite', type: 'Arène', active: true },
    ],
    mode_slots: [],
    custom_rules: [],
  },
]
