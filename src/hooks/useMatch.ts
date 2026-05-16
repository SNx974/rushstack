import { useState, useEffect, useCallback } from 'react'
import {
  getActiveMatch, getMatch, updateStage, setHost as svcSetHost,
  banMap as svcBanMap, submitReport as svcSubmitReport,
  resolveConflict as svcResolveConflict, distributeMMR as svcDistributeMMR,
  setPickedMap as svcSetPickedMap, generateLobbyCode, shufflePlayers,
  type MatchSession, type Stage,
} from '@/services/match.service'
import { pollMatchState } from '@/services/chat.service'

export function useMatch(userId: string | null) {
  const [match, setMatch] = useState<MatchSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)

  // Load active match on mount
  useEffect(() => {
    if (!userId) { setLoading(false); return }
    getActiveMatch(userId).then(m => { setMatch(m); setLoading(false) })
  }, [userId])

  // Poll for state changes once a match is active
  useEffect(() => {
    if (!match?.id || polling) return
    setPolling(true)
    const stop = pollMatchState(
      () => getMatch(match.id),
      (updated) => setMatch(updated),
      2500
    )
    return stop
  }, [match?.id])

  /* ── Actions ─────────────────────────────────────────────── */

  const advanceStage = useCallback(async (stage: Stage) => {
    if (!match) return
    try {
      const updated = await updateStage(match.id, stage)
      setMatch(updated)
    } catch {
      // Optimistic local update if API not ready
      setMatch(m => m ? { ...m, stage } : m)
    }
  }, [match])

  const assignHost = useCallback(async (hostId: string) => {
    if (!match) return
    try {
      const updated = await svcSetHost(match.id, hostId)
      setMatch(updated)
    } catch {
      setMatch(m => m ? { ...m, host_id: hostId } : m)
    }
  }, [match])

  const performBan = useCallback(async (mapId: string, team: 'A' | 'B', orderIndex: number) => {
    if (!match) return
    try {
      const ban = await svcBanMap(match.id, mapId, team, orderIndex)
      setMatch(m => m ? { ...m, map_bans: [...m.map_bans, ban] } : m)
    } catch {
      setMatch(m => m ? {
        ...m,
        map_bans: [...m.map_bans, { id: crypto.randomUUID(), match_id: m.id, map_id: mapId, banned_by_team: team, order_index: orderIndex }]
      } : m)
    }
  }, [match])

  const pickMap = useCallback(async (mapId: string) => {
    if (!match) return
    const code = generateLobbyCode()
    try {
      const updated = await svcSetPickedMap(match.id, mapId, code)
      setMatch(updated)
    } catch {
      setMatch(m => m ? { ...m, picked_map: mapId, lobby_code: code } : m)
    }
  }, [match])

  const report = useCallback(async (team: 'A' | 'B', result: 'win' | 'loss') => {
    if (!match || !userId) return
    try {
      const r = await svcSubmitReport(match.id, team, result, userId)
      setMatch(m => m ? { ...m, reports: [...m.reports.filter(x => x.team !== team), r] } : m)
    } catch {
      setMatch(m => m ? {
        ...m,
        reports: [...m.reports.filter(x => x.team !== team), {
          id: crypto.randomUUID(), match_id: m.id, team, result, reported_by: userId ?? ''
        }]
      } : m)
    }
  }, [match, userId])

  const resolveConflict = useCallback(async (winnerTeam: 'A' | 'B') => {
    if (!match) return
    try {
      const updated = await svcResolveConflict(match.id, winnerTeam)
      setMatch(updated)
    } catch {
      setMatch(m => m ? { ...m, winner_team: winnerTeam, conflict: false } : m)
    }
  }, [match])

  const doDistributeMMR = useCallback(async () => {
    if (!match) return
    try {
      const updated = await svcDistributeMMR(match.id)
      setMatch(updated)
    } catch { /* handled locally in ConfirmStage */ }
  }, [match])

  const doShuffle = useCallback(() => {
    setMatch(m => {
      if (!m) return m
      const shuffled = shufflePlayers(m.players)
      return { ...m, players: shuffled }
    })
  }, [])

  return {
    match, loading,
    advanceStage, assignHost, performBan, pickMap,
    report, resolveConflict, doDistributeMMR, doShuffle,
  }
}
