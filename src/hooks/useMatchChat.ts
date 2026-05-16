import { useState, useEffect, useRef, useCallback } from 'react'
import { sendMessage, pollMessages, type ChatMessage } from '@/services/chat.service'

function now() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function useMatchChat(
  matchId: string | null,
  myTeam: 'A' | 'B',
  authorName: string,
  userId?: string
) {
  const [teamMessages, setTeamMessages]     = useState<ChatMessage[]>([])
  const [globalMessages, setGlobalMessages] = useState<ChatMessage[]>([])

  // Bootstrap with initial messages so UI isn't empty
  useEffect(() => {
    if (!matchId) return
    setTeamMessages([
      { id: '1', match_id: matchId, user_id: '', author_name: 'System', text: 'Bienvenue dans le tchat équipe ! GL HF 🔥', scope: 'team', team: myTeam, created_at: now() },
    ])
    setGlobalMessages([
      { id: '2', match_id: matchId, user_id: '', author_name: 'System', text: 'Lobby créé — bonne chance à tous ! 👊', scope: 'global', team: myTeam, created_at: now() },
    ])
  }, [matchId])

  // Poll team chat
  useEffect(() => {
    if (!matchId) return
    const stop = pollMessages(matchId, 'team', myTeam, msgs => setTeamMessages(msgs), 2500)
    return stop
  }, [matchId, myTeam])

  // Poll global chat
  useEffect(() => {
    if (!matchId) return
    const stop = pollMessages(matchId, 'global', myTeam, msgs => setGlobalMessages(msgs), 2500)
    return stop
  }, [matchId, myTeam])

  const sendTeam = useCallback(async (text: string) => {
    if (!matchId) return
    const optimistic: ChatMessage = {
      id: crypto.randomUUID(), match_id: matchId, user_id: userId ?? '',
      author_name: authorName, text, scope: 'team', team: myTeam, created_at: now(),
    }
    setTeamMessages(m => [...m, optimistic])
    try {
      await sendMessage(matchId, authorName, text, 'team', myTeam, userId)
    } catch { /* keep optimistic */ }
  }, [matchId, authorName, myTeam, userId])

  const sendGlobal = useCallback(async (text: string) => {
    if (!matchId) return
    const optimistic: ChatMessage = {
      id: crypto.randomUUID(), match_id: matchId, user_id: userId ?? '',
      author_name: authorName, text, scope: 'global', team: myTeam, created_at: now(),
    }
    setGlobalMessages(m => [...m, optimistic])
    try {
      await sendMessage(matchId, authorName, text, 'global', myTeam, userId)
    } catch { /* keep optimistic */ }
  }, [matchId, authorName, myTeam, userId])

  return { teamMessages, globalMessages, sendTeam, sendGlobal }
}
