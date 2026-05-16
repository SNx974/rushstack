import { api } from '@/lib/api'

export interface ChatMessage {
  id: string
  match_id: string
  user_id: string
  author_name: string
  text: string
  scope: 'team' | 'global'
  team: 'A' | 'B'
  created_at: string
}

export async function getMessages(matchId: string, scope: 'team' | 'global', team?: 'A' | 'B'): Promise<ChatMessage[]> {
  try {
    const q = team ? `?scope=${scope}&team=${team}` : `?scope=${scope}`
    return await api.get<ChatMessage[]>(`/matches/${matchId}/messages${q}`)
  } catch {
    return []
  }
}

export async function sendMessage(
  matchId: string,
  authorName: string,
  text: string,
  scope: 'team' | 'global',
  team: 'A' | 'B',
  userId?: string
): Promise<ChatMessage> {
  return api.post<ChatMessage>(`/matches/${matchId}/messages`, {
    author_name: authorName,
    text,
    scope,
    team,
    user_id: userId,
  })
}

/* ── Polling helper ──────────────────────────────────────── */
// Retourne une fonction stop() pour arrêter le polling
export function pollMessages(
  matchId: string,
  scope: 'team' | 'global',
  team: 'A' | 'B',
  onMessages: (msgs: ChatMessage[]) => void,
  intervalMs = 2500
): () => void {
  let lastId = ''
  const tick = async () => {
    const msgs = await getMessages(matchId, scope, team)
    if (msgs.length > 0 && msgs[msgs.length - 1].id !== lastId) {
      lastId = msgs[msgs.length - 1].id
      onMessages(msgs)
    }
  }
  tick()
  const id = setInterval(tick, intervalMs)
  return () => clearInterval(id)
}

/* ── Polling match state ─────────────────────────────────── */
export function pollMatchState<T>(
  fetcher: () => Promise<T>,
  onChange: (data: T) => void,
  intervalMs = 2500
): () => void {
  const tick = async () => {
    try {
      const data = await fetcher()
      onChange(data)
    } catch { /* silent */ }
  }
  tick()
  const id = setInterval(tick, intervalMs)
  return () => clearInterval(id)
}
