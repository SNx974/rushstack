import { api } from '@/lib/api'

export type Stage = 'lobby' | 'mapban' | 'ingame' | 'report' | 'confirm' | 'done'

export interface MatchPlayer {
  id: string
  match_id: string
  user_id: string
  team: 'A' | 'B'
  is_captain: boolean
  mmr_before: number
  mmr_after: number | null
  seed: number
  name: string
  tag: string
  rank: string
  you?: boolean
}

export interface MapBan {
  id: string
  match_id: string
  map_id: string
  banned_by_team: 'A' | 'B'
  order_index: number
}

export interface MatchReport {
  id: string
  match_id: string
  team: 'A' | 'B'
  result: 'win' | 'loss'
  reported_by: string
}

export interface MatchSession {
  id: string
  game_id: string
  stage: Stage
  picked_map: string | null
  lobby_code: string | null
  host_id: string | null
  winner_team: 'A' | 'B' | null
  conflict: boolean
  players: MatchPlayer[]
  map_bans: MapBan[]
  reports: MatchReport[]
  created_at: string
  updated_at: string
}

/* ── Match CRUD ──────────────────────────────────────────── */

export async function getActiveMatch(userId: string): Promise<MatchSession | null> {
  try {
    return await api.get<MatchSession>(`/matches/active?user_id=${userId}`)
  } catch {
    return null
  }
}

export async function getMatch(matchId: string): Promise<MatchSession> {
  return api.get<MatchSession>(`/matches/${matchId}`)
}

export async function createMatch(gameId: string, players: Omit<MatchPlayer, 'id' | 'match_id'>[]): Promise<MatchSession> {
  return api.post<MatchSession>('/matches', { game_id: gameId, players })
}

export async function updateStage(matchId: string, stage: Stage): Promise<MatchSession> {
  return api.patch<MatchSession>(`/matches/${matchId}/stage`, { stage })
}

export async function setHost(matchId: string, hostId: string): Promise<MatchSession> {
  return api.patch<MatchSession>(`/matches/${matchId}/host`, { host_id: hostId })
}

export async function setPickedMap(matchId: string, mapId: string, lobbyCode: string): Promise<MatchSession> {
  return api.patch<MatchSession>(`/matches/${matchId}/map`, { picked_map: mapId, lobby_code: lobbyCode })
}

export async function banMap(matchId: string, mapId: string, team: 'A' | 'B', orderIndex: number): Promise<MapBan> {
  return api.post<MapBan>(`/matches/${matchId}/bans`, { map_id: mapId, banned_by_team: team, order_index: orderIndex })
}

export async function submitReport(matchId: string, team: 'A' | 'B', result: 'win' | 'loss', reportedBy: string): Promise<MatchReport> {
  return api.post<MatchReport>(`/matches/${matchId}/reports`, { team, result, reported_by: reportedBy })
}

export async function resolveConflict(matchId: string, winnerTeam: 'A' | 'B'): Promise<MatchSession> {
  return api.patch<MatchSession>(`/matches/${matchId}/resolve`, { winner_team: winnerTeam })
}

export async function distributeMMR(matchId: string): Promise<MatchSession> {
  return api.post<MatchSession>(`/matches/${matchId}/distribute`, {})
}

export async function getConflicts(): Promise<MatchSession[]> {
  try {
    return await api.get<MatchSession[]>('/matches/conflicts')
  } catch {
    return []
  }
}

/* ── Utilitaires ─────────────────────────────────────────── */

export function generateLobbyCode(): string {
  return `RUSH-${Math.floor(Math.random() * 9000 + 1000)}`
}

export function computeMMRDelta(won: boolean, mmrDiff: number = 0): number {
  const base = won ? 24 : -18
  const variance = Math.round((Math.random() - 0.5) * 8)
  const diffBonus = Math.round(mmrDiff / 100)
  return base + variance + (won ? diffBonus : -diffBonus)
}

export function pickCaptains(players: MatchPlayer[]): { A: string; B: string } {
  const teamA = players.filter(p => p.team === 'A').sort((a, b) => b.mmr_before - a.mmr_before)
  const teamB = players.filter(p => p.team === 'B').sort((a, b) => b.mmr_before - a.mmr_before)
  return { A: teamA[0]?.user_id ?? '', B: teamB[0]?.user_id ?? '' }
}

export function shufflePlayers(players: MatchPlayer[]): MatchPlayer[] {
  const shuffled = [...players].sort(() => Math.random() - 0.5)
  return shuffled.map((p, i) => ({ ...p, team: i < 5 ? 'A' : 'B' as 'A' | 'B' }))
}
