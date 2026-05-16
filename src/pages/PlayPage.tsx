import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useGames } from '@/hooks/useGames'
import { useMatch } from '@/hooks/useMatch'
import { useMatchChat } from '@/hooks/useMatchChat'
import { SeedAvatar, RankBadge, SmallGameLogo } from '@/components/esport/EsportUI'
import type { MatchSession, MatchPlayer } from '@/services/match.service'

/* ── Constants ─────────────────────────────────────────── */
const STAGES = ['lobby', 'mapban', 'ingame', 'report', 'confirm'] as const
type StageId = typeof STAGES[number]

const BAN_ORDER: Array<'A' | 'B'> = ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B']

const DEFAULT_MAPS = [
  { id: 'bind', name: 'Bind', color: '#c0392b' },
  { id: 'haven', name: 'Haven', color: '#27ae60' },
  { id: 'split', name: 'Split', color: '#2980b9' },
  { id: 'ascent', name: 'Ascent', color: '#f39c12' },
  { id: 'icebox', name: 'Icebox', color: '#1abc9c' },
  { id: 'breeze', name: 'Breeze', color: '#8e44ad' },
  { id: 'fracture', name: 'Fracture', color: '#e67e22' },
  { id: 'pearl', name: 'Pearl', color: '#2c3e50' },
  { id: 'lotus', name: 'Lotus', color: '#e74c3c' },
]

const POOL_10: MatchPlayer[] = Array.from({ length: 10 }, (_, i) => ({
  id: `p${i}`, match_id: 'demo', user_id: `u${i}`,
  team: i < 5 ? 'A' : 'B',
  is_captain: i === 0 || i === 5,
  mmr_before: 1800 + Math.round(Math.random() * 800),
  mmr_after: null,
  seed: i,
  name: ['Striker', 'Shadow', 'Blaze', 'Vortex', 'Phantom', 'Nova', 'Cipher', 'Rush', 'Echo', 'Titan'][i],
  tag: `#${1000 + i * 137}`,
  rank: ['DIAMOND', 'PLATINUM', 'DIAMOND', 'GOLD', 'PLATINUM', 'DIAMOND', 'PLATINUM', 'GOLD', 'DIAMOND', 'PLATINUM'][i],
}))

/* ── Shared style ──────────────────────────────────────── */
const S = {
  panel: { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12 } as const,
  panel2: { background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 10 } as const,
  red: '#ef2434',
  muted: 'rgba(255,255,255,0.4)',
  muted2: 'rgba(255,255,255,0.15)',
}

/* ── ChatPanel ─────────────────────────────────────────── */
interface ChatPanelProps {
  tab: 'team' | 'global'
  onTabChange: (t: 'team' | 'global') => void
  teamMessages: Array<{ id: string; author_name: string; text: string; created_at: string }>
  globalMessages: Array<{ id: string; author_name: string; text: string; created_at: string }>
  onSendTeam: (text: string) => void
  onSendGlobal: (text: string) => void
  myTeam: 'A' | 'B'
}
function ChatPanel({ tab, onTabChange, teamMessages, globalMessages, onSendTeam, onSendGlobal, myTeam }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const msgs = tab === 'team' ? teamMessages : globalMessages

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length])

  const send = () => {
    const t = input.trim()
    if (!t) return
    if (tab === 'team') onSendTeam(t)
    else onSendGlobal(t)
    setInput('')
  }

  return (
    <div style={{ ...S.panel, display: 'flex', flexDirection: 'column', height: 420 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)' }}>
        {(['team', 'global'] as const).map(t => (
          <button key={t} onClick={() => onTabChange(t)} style={{
            flex: 1, padding: '10px 0', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: tab === t ? '#fff' : S.muted,
            borderBottom: tab === t ? `2px solid ${S.red}` : '2px solid transparent',
            background: 'none', border: 'none', cursor: 'pointer',
          }}>
            {t === 'team' ? `Équipe ${myTeam}` : 'Global'}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {msgs.map(m => (
          <div key={m.id}>
            <span style={{ fontSize: 10, color: S.muted, marginRight: 6 }}>{m.created_at}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: tab === 'team' ? '#60b4ff' : '#ff9f43', marginRight: 6 }}>{m.author_name}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{m.text}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Envoyer un message…"
          style={{
            flex: 1, background: 'var(--panel-2)', border: '1px solid var(--line)',
            borderRadius: 6, padding: '7px 10px', color: '#fff', fontSize: 12, outline: 'none',
          }}
        />
        <button onClick={send} style={{
          background: S.red, border: 'none', borderRadius: 6, padding: '7px 14px',
          color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>↑</button>
      </div>
    </div>
  )
}

/* ── TeamCard ──────────────────────────────────────────── */
function TeamCard({ players, team, label }: { players: MatchPlayer[]; team: 'A' | 'B'; label: string }) {
  const color = team === 'A' ? '#ef2434' : '#60b4ff'
  return (
    <div style={{ ...S.panel, padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color, marginBottom: 12 }}>{label}</div>
      {players.filter(p => p.team === team).map(p => (
        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <SeedAvatar seed={p.seed} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              {p.name}
              {p.is_captain && <span style={{ fontSize: 9, background: color, color: '#fff', borderRadius: 3, padding: '1px 5px', fontWeight: 800 }}>CAP</span>}
            </div>
            <div style={{ fontSize: 11, color: S.muted }}>{p.tag}</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>{p.mmr_before}</div>
          <RankBadge rank={p.rank} size={18} />
        </div>
      ))}
    </div>
  )
}

/* ── MapTile ───────────────────────────────────────────── */
function MapTile({ map, banned, picked, onClick, disabled }: {
  map: { id: string; name: string; color: string }
  banned?: boolean; picked?: boolean; onClick?: () => void; disabled?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled || banned} style={{
      position: 'relative', width: '100%', aspectRatio: '16/9',
      borderRadius: 8, overflow: 'hidden', cursor: disabled || banned ? 'default' : 'pointer',
      border: picked ? '2px solid #27ae60' : banned ? '2px solid #333' : '2px solid var(--line)',
      opacity: banned ? 0.35 : 1, transition: 'all 0.2s', background: map.color,
    }}>
      {/* SVG pattern */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id={`mp-${map.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 10 L10 0 L20 10 L10 20Z" fill="rgba(0,0,0,0.15)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#mp-${map.id})`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{map.name}</div>
        {banned && <div style={{ fontSize: 10, color: '#ff4444', fontWeight: 700, marginTop: 2 }}>BANNI</div>}
        {picked && <div style={{ fontSize: 10, color: '#27ae60', fontWeight: 700, marginTop: 2 }}>CHOISI</div>}
      </div>
    </button>
  )
}

/* ── LobbyStage ────────────────────────────────────────── */
function LobbyStage({ match, myTeam, onReady, onShuffle }: {
  match: MatchSession | null; myTeam: 'A' | 'B'
  onReady: () => void; onShuffle: () => void
}) {
  const [animating, setAnimating] = useState(false)
  const [displayPlayers, setDisplayPlayers] = useState<MatchPlayer[]>(match?.players ?? POOL_10)

  const handleShuffle = () => {
    setAnimating(true)
    let count = 0
    const interval = setInterval(() => {
      setDisplayPlayers(prev => {
        const shuffled = [...prev].sort(() => Math.random() - 0.5)
        return shuffled.map((p, i) => ({ ...p, team: i < 5 ? 'A' : 'B' as 'A' | 'B' }))
      })
      count++
      if (count >= 8) { clearInterval(interval); setAnimating(false); onShuffle() }
    }, 120)
  }

  const players = match?.players ?? displayPlayers

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <TeamCard players={players} team="A" label="⚔ ÉQUIPE A" />
      <TeamCard players={players} team="B" label="🛡 ÉQUIPE B" />
      <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
        <button onClick={handleShuffle} disabled={animating} style={{
          background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8,
          padding: '10px 28px', color: S.muted, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>
          {animating ? '⟳ Mélange…' : '⟳ Mélanger'}
        </button>
        <button onClick={onReady} style={{
          background: S.red, border: 'none', borderRadius: 8,
          padding: '10px 36px', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
          letterSpacing: '0.06em',
        }}>
          ✓ PRÊT
        </button>
      </div>
    </div>
  )
}

/* ── MapBanStage ───────────────────────────────────────── */
function MapBanStage({ match, myTeam, maps, onBan, onAdvance }: {
  match: MatchSession | null; myTeam: 'A' | 'B'
  maps: Array<{ id: string; name: string; color: string }>
  onBan: (mapId: string, team: 'A' | 'B', orderIndex: number) => void
  onAdvance: () => void
}) {
  const bans = match?.map_bans ?? []
  const currentBanIndex = bans.length
  const done = currentBanIndex >= BAN_ORDER.length
  const pickedMap = match?.picked_map ?? (done ? maps.find(m => !bans.find(b => b.map_id === m.id))?.id ?? null : null)

  const currentTeam = done ? null : BAN_ORDER[currentBanIndex]
  const isMyTurn = currentTeam === myTeam

  // Opponent auto-ban
  useEffect(() => {
    if (done || isMyTurn) return
    const available = maps.filter(m => !bans.find(b => b.map_id === m.id))
    if (!available.length) return
    const t = setTimeout(() => {
      const pick = available[Math.floor(Math.random() * available.length)]
      onBan(pick.id, currentTeam!, currentBanIndex)
    }, 2000)
    return () => clearTimeout(t)
  }, [currentBanIndex, isMyTurn, done])

  useEffect(() => {
    if (done && !pickedMap) onAdvance()
  }, [done])

  const bannedIds = new Set(bans.map(b => b.map_id))

  return (
    <div>
      {/* Ban order strip */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, justifyContent: 'center' }}>
        {BAN_ORDER.map((team, i) => {
          const ban = bans[i]
          const active = i === currentBanIndex
          const color = team === 'A' ? '#ef2434' : '#60b4ff'
          return (
            <div key={i} style={{
              width: 32, height: 32, borderRadius: 6, border: `2px solid ${active ? color : 'var(--line)'}`,
              background: ban ? color : 'var(--panel-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: ban ? '#fff' : color,
              transition: 'all 0.2s',
            }}>
              {ban ? '✕' : team}
            </div>
          )
        })}
      </div>

      {/* Status */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        {done ? (
          <div>
            <div style={{ fontSize: 13, color: '#27ae60', fontWeight: 700 }}>✓ Carte choisie</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>
              {maps.find(m => m.id === pickedMap)?.name ?? '—'}
            </div>
            <button onClick={onAdvance} style={{
              marginTop: 12, background: S.red, border: 'none', borderRadius: 8,
              padding: '9px 32px', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
            }}>→ EN JEU</button>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: S.muted, fontWeight: 600 }}>
            {isMyTurn
              ? <span style={{ color: '#fff', fontWeight: 800 }}>C'est votre tour — bannissez une carte</span>
              : `L'équipe ${currentTeam} choisit…`}
          </div>
        )}
      </div>

      {/* Map grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {maps.map(m => (
          <MapTile
            key={m.id}
            map={m}
            banned={bannedIds.has(m.id)}
            picked={m.id === pickedMap && done}
            disabled={!isMyTurn || done}
            onClick={() => isMyTurn && !done && onBan(m.id, myTeam, currentBanIndex)}
          />
        ))}
      </div>
    </div>
  )
}

/* ── InGameStage ───────────────────────────────────────── */
function InGameStage({ match, myTeam, userId, onAssignHost, onAdvance }: {
  match: MatchSession | null; myTeam: 'A' | 'B'; userId: string
  onAssignHost: (hostId: string) => void
  onAdvance: () => void
}) {
  const [elapsed, setElapsed] = useState(0)
  const teamA = match?.players.filter(p => p.team === 'A') ?? []
  const teamB = match?.players.filter(p => p.team === 'B') ?? []
  const isCaptain = match?.players.find(p => p.user_id === userId)?.is_captain ?? false

  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const pickedMap = match?.picked_map ?? 'Inconnue'
  const lobbyCode = match?.lobby_code ?? '—'
  const hostId = match?.host_id
  const host = match?.players.find(p => p.user_id === hostId)

  const renderPlayer = (p: MatchPlayer) => (
    <div key={p.id} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
      background: hostId === p.user_id ? 'rgba(239,36,52,0.1)' : 'var(--panel-2)',
      border: hostId === p.user_id ? '1px solid rgba(239,36,52,0.4)' : '1px solid var(--line)',
      borderRadius: 8, marginBottom: 6, cursor: isCaptain && !hostId ? 'pointer' : 'default',
      transition: 'all 0.15s',
    }} onClick={() => isCaptain && !hostId && onAssignHost(p.user_id)}>
      <SeedAvatar seed={p.seed} size={28} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{p.name}</div>
        <div style={{ fontSize: 10, color: S.muted }}>{p.tag}</div>
      </div>
      {p.is_captain && <span style={{ fontSize: 9, background: p.team === 'A' ? '#ef2434' : '#60b4ff', color: '#fff', borderRadius: 3, padding: '1px 5px', fontWeight: 800 }}>CAP</span>}
      {hostId === p.user_id && <span style={{ fontSize: 9, background: '#f39c12', color: '#fff', borderRadius: 3, padding: '1px 5px', fontWeight: 800 }}>HOST</span>}
    </div>
  )

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ ...S.panel2, flex: 1, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: S.muted, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>CARTE</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{pickedMap}</div>
        </div>
        <div style={{ ...S.panel2, flex: 1, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: S.muted, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>CODE LOBBY</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: S.red, fontFamily: 'JetBrains Mono, monospace' }}>{lobbyCode}</div>
        </div>
        <div style={{ ...S.panel2, flex: 1, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: S.muted, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>DURÉE</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>{fmt(elapsed)}</div>
        </div>
      </div>

      {/* Teams */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: '#ef2434', fontWeight: 800, letterSpacing: '0.1em', marginBottom: 8 }}>⚔ ÉQUIPE A</div>
          {teamA.map(renderPlayer)}
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#60b4ff', fontWeight: 800, letterSpacing: '0.1em', marginBottom: 8 }}>🛡 ÉQUIPE B</div>
          {teamB.map(renderPlayer)}
        </div>
      </div>

      {!hostId && isCaptain && (
        <div style={{ ...S.panel2, padding: 12, textAlign: 'center', marginBottom: 12, border: '1px solid rgba(239,36,52,0.3)' }}>
          <div style={{ fontSize: 12, color: S.muted }}>Sélectionnez le joueur qui crée le lobby (host)</div>
        </div>
      )}

      {host && (
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: S.muted }}>Host : </span>
          <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>{host.name}</span>
          <span style={{ fontSize: 12, color: '#f39c12', marginLeft: 8 }}>— Code: </span>
          <span style={{ fontSize: 12, color: '#f39c12', fontWeight: 800, fontFamily: 'monospace' }}>{lobbyCode}</span>
        </div>
      )}

      <button onClick={onAdvance} style={{
        width: '100%', background: S.red, border: 'none', borderRadius: 8,
        padding: '11px 0', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
        letterSpacing: '0.06em',
      }}>
        ✓ MATCH TERMINÉ — SOUMETTRE RÉSULTAT
      </button>
    </div>
  )
}

/* ── ReportStage ───────────────────────────────────────── */
function ReportStage({ match, myTeam, userId, onReport, onResolve, onAdvance }: {
  match: MatchSession | null; myTeam: 'A' | 'B'; userId: string
  onReport: (team: 'A' | 'B', result: 'win' | 'loss') => void
  onResolve: (winner: 'A' | 'B') => void
  onAdvance: () => void
}) {
  const reports = match?.reports ?? []
  const myReport = reports.find(r => r.team === myTeam)
  const opponentTeam: 'A' | 'B' = myTeam === 'A' ? 'B' : 'A'
  const opponentReport = reports.find(r => r.team === opponentTeam)
  const conflict = match?.conflict ?? (myReport && opponentReport && myReport.result === opponentReport.result)
  const isAdmin = false // would come from auth context

  // Auto opponent vote
  useEffect(() => {
    if (opponentReport || !myReport) return
    const t = setTimeout(() => {
      // Opponent agrees with player's report (consistent)
      const opResult: 'win' | 'loss' = myReport.result === 'win' ? 'loss' : 'win'
      onReport(opponentTeam, opResult)
    }, 3500)
    return () => clearTimeout(t)
  }, [myReport?.id])

  // Auto-advance when both agree
  useEffect(() => {
    if (myReport && opponentReport && !conflict) {
      const t = setTimeout(onAdvance, 800)
      return () => clearTimeout(t)
    }
  }, [myReport?.id, opponentReport?.id, conflict])

  const winner = match?.winner_team

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '0.04em' }}>RÉSULTAT DU MATCH</div>
        <div style={{ fontSize: 13, color: S.muted, marginTop: 4 }}>Soumettez votre résultat</div>
      </div>

      {!myReport && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button onClick={() => onReport(myTeam, 'win')} style={{
            flex: 1, padding: '18px 0', border: '2px solid rgba(39,174,96,0.5)',
            borderRadius: 10, background: 'rgba(39,174,96,0.1)', color: '#27ae60',
            fontSize: 16, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.06em',
          }}>🏆 VICTOIRE</button>
          <button onClick={() => onReport(myTeam, 'loss')} style={{
            flex: 1, padding: '18px 0', border: '2px solid rgba(239,36,52,0.4)',
            borderRadius: 10, background: 'rgba(239,36,52,0.07)', color: S.red,
            fontSize: 16, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.06em',
          }}>💀 DÉFAITE</button>
        </div>
      )}

      {myReport && (
        <div style={{ ...S.panel2, padding: 16, marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: S.muted, marginBottom: 4 }}>Votre rapport</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: myReport.result === 'win' ? '#27ae60' : S.red }}>
            {myReport.result === 'win' ? '🏆 VICTOIRE' : '💀 DÉFAITE'}
          </div>
        </div>
      )}

      {opponentReport && (
        <div style={{ ...S.panel2, padding: 12, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: S.muted, marginBottom: 2 }}>Rapport adverse</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: opponentReport.result === 'win' ? '#27ae60' : S.red }}>
            {opponentReport.result === 'win' ? '🏆 Victoire' : '💀 Défaite'}
          </div>
        </div>
      )}

      {!myReport && !opponentReport && (
        <div style={{ fontSize: 12, color: S.muted, textAlign: 'center' }}>En attente des rapports…</div>
      )}

      {conflict && !winner && (
        <div style={{ ...S.panel, padding: 16, border: '1px solid rgba(243,156,18,0.4)', marginTop: 8 }}>
          <div style={{ fontSize: 13, color: '#f39c12', fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>⚠ CONFLIT DÉTECTÉ</div>
          <div style={{ fontSize: 12, color: S.muted, textAlign: 'center', marginBottom: 12 }}>
            En attente d'un admin pour trancher…
          </div>
          {isAdmin && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onResolve('A')} style={{ flex: 1, padding: '8px 0', background: 'rgba(239,36,52,0.2)', border: '1px solid rgba(239,36,52,0.5)', borderRadius: 6, color: '#ef2434', fontWeight: 700, cursor: 'pointer' }}>Équipe A gagne</button>
              <button onClick={() => onResolve('B')} style={{ flex: 1, padding: '8px 0', background: 'rgba(96,180,255,0.2)', border: '1px solid rgba(96,180,255,0.5)', borderRadius: 6, color: '#60b4ff', fontWeight: 700, cursor: 'pointer' }}>Équipe B gagne</button>
            </div>
          )}
        </div>
      )}

      {winner && (
        <div style={{ textAlign: 'center', padding: 16 }}>
          <div style={{ fontSize: 11, color: S.muted, marginBottom: 4 }}>Vainqueur désigné</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: winner === myTeam ? '#27ae60' : S.red }}>
            ÉQUIPE {winner}
          </div>
          <button onClick={onAdvance} style={{
            marginTop: 14, background: S.red, border: 'none', borderRadius: 8,
            padding: '10px 32px', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
          }}>→ VOIR MMR</button>
        </div>
      )}
    </div>
  )
}

/* ── RewardPill ────────────────────────────────────────── */
function RewardPill({ delta }: { delta: number }) {
  const pos = delta >= 0
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '3px 8px', borderRadius: 20,
      background: pos ? 'rgba(39,174,96,0.15)' : 'rgba(239,36,52,0.12)',
      color: pos ? '#27ae60' : S.red, fontSize: 12, fontWeight: 800,
    }}>
      {pos ? '+' : ''}{delta} MMR
    </span>
  )
}

/* ── ConfirmStage ──────────────────────────────────────── */
function ConfirmStage({ match, myTeam }: { match: MatchSession | null; myTeam: 'A' | 'B' }) {
  const [progress, setProgress] = useState(0)
  const winner = match?.winner_team ?? myTeam
  const players = match?.players ?? POOL_10

  useEffect(() => {
    const start = performance.now()
    const duration = 2000
    const frame = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setProgress(1 - Math.pow(1 - p, 3))
      if (p < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [])

  const getMMRDelta = (p: MatchPlayer) => {
    const won = p.team === winner
    const base = won ? 24 : -18
    const variance = Math.round(((p.seed * 17 + 7) % 9) - 4)
    return base + variance
  }

  const won = myTeam === winner

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      {/* Result banner */}
      <div style={{
        textAlign: 'center', padding: '28px 0 20px',
        background: won ? 'linear-gradient(180deg, rgba(39,174,96,0.12) 0%, transparent 100%)' : 'linear-gradient(180deg, rgba(239,36,52,0.1) 0%, transparent 100%)',
        borderRadius: 12, marginBottom: 24,
      }}>
        <div style={{ fontSize: 11, letterSpacing: '0.2em', color: S.muted, marginBottom: 6 }}>RÉSULTAT FINAL</div>
        <div style={{ fontSize: 38, fontWeight: 900, color: won ? '#27ae60' : S.red, letterSpacing: '0.02em' }}>
          {won ? 'VICTOIRE' : 'DÉFAITE'}
        </div>
        <div style={{ fontSize: 13, color: S.muted, marginTop: 4 }}>Équipe {winner} remporte le match</div>
      </div>

      {/* MMR distribution */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: S.muted, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 10 }}>DISTRIBUTION MMR</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {players.map(p => {
            const delta = getMMRDelta(p)
            const animDelta = Math.round(delta * progress)
            const newMMR = p.mmr_before + animDelta
            return (
              <div key={p.id} style={{
                ...S.panel2, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
                border: p.team === winner ? '1px solid rgba(39,174,96,0.25)' : '1px solid var(--line)',
              }}>
                <SeedAvatar seed={p.seed} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: S.muted }}>{p.mmr_before} → <span style={{ color: '#fff', fontWeight: 700 }}>{newMMR}</span></div>
                </div>
                <RewardPill delta={animDelta} />
              </div>
            )
          })}
        </div>
      </div>

      <button onClick={() => window.location.href = '/'} style={{
        width: '100%', background: S.red, border: 'none', borderRadius: 8,
        padding: '12px 0', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
        letterSpacing: '0.06em',
      }}>
        ← RETOUR À L'ACCUEIL
      </button>
    </div>
  )
}

/* ── PlayPage root ─────────────────────────────────────── */
export default function PlayPage() {
  const user = useAuthStore(s => s.user)
  const userId = user?.id ?? ''
  const authorName = user?.display_name ?? user?.username ?? 'Joueur'

  const { match, advanceStage, assignHost, performBan, pickMap, report, resolveConflict, doDistributeMMR, doShuffle } = useMatch(userId || null)
  const { games } = useGames()

  const myPlayer = match?.players.find(p => p.user_id === userId)
  const myTeam: 'A' | 'B' = myPlayer?.team ?? 'A'

  const { teamMessages, globalMessages, sendTeam, sendGlobal } = useMatchChat(
    match?.id ?? null, myTeam, authorName, userId || undefined
  )

  const [chatTab, setChatTab] = useState<'team' | 'global'>('team')

  // Derive maps for the active game
  const activeGame = games.find(g => g.id === match?.game_id)
  const maps = activeGame?.maps?.length
    ? activeGame.maps.map(m => ({ id: m.id, name: m.name, color: '#444' }))
    : DEFAULT_MAPS

  const stage = match?.stage ?? 'lobby'

  const stageLabels: Record<string, string> = {
    lobby: 'LOBBY', mapban: 'BAN CARTES', ingame: 'EN JEU', report: 'RÉSULTAT', confirm: 'MMR'
  }
  const stageOrder = ['lobby', 'mapban', 'ingame', 'report', 'confirm']
  const stageIndex = stageOrder.indexOf(stage)

  const handleBan = async (mapId: string, team: 'A' | 'B', orderIndex: number) => {
    await performBan(mapId, team, orderIndex)
    // If all bans done, pick last map and advance
    const newBans = (match?.map_bans ?? []).length + 1
    if (newBans >= BAN_ORDER.length) {
      const bannedIds = new Set([...(match?.map_bans ?? []).map(b => b.map_id), mapId])
      const lastMap = maps.find(m => !bannedIds.has(m.id))
      if (lastMap) await pickMap(lastMap.id)
    }
  }

  // No match: show waiting screen
  if (!match) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚔</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Aucun match actif</div>
          <div style={{ fontSize: 14, color: S.muted, marginBottom: 24 }}>Rejoignez une queue pour commencer</div>
          <a href="/" style={{ background: S.red, color: '#fff', padding: '12px 32px', borderRadius: 8, fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
            LANCER UNE QUEUE
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 32px' }}>
      {/* Stage progress bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)' }}>
        {stageOrder.map((s, i) => (
          <div key={s} style={{
            flex: 1, padding: '9px 0', textAlign: 'center',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
            background: i < stageIndex ? 'rgba(239,36,52,0.15)' : i === stageIndex ? S.red : 'var(--panel)',
            color: i <= stageIndex ? '#fff' : S.muted,
            borderRight: i < stageOrder.length - 1 ? '1px solid var(--line)' : 'none',
            transition: 'all 0.3s',
          }}>
            {i < stageIndex ? '✓ ' : ''}{stageLabels[s]}
          </div>
        ))}
      </div>

      {/* Content + Chat */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Main stage content */}
        <div style={{ ...S.panel, padding: 24 }}>
          {stage === 'lobby' && (
            <LobbyStage
              match={match}
              myTeam={myTeam}
              onReady={() => advanceStage('mapban')}
              onShuffle={doShuffle}
            />
          )}
          {stage === 'mapban' && (
            <MapBanStage
              match={match}
              myTeam={myTeam}
              maps={maps}
              onBan={handleBan}
              onAdvance={() => advanceStage('ingame')}
            />
          )}
          {stage === 'ingame' && (
            <InGameStage
              match={match}
              myTeam={myTeam}
              userId={userId}
              onAssignHost={assignHost}
              onAdvance={() => advanceStage('report')}
            />
          )}
          {stage === 'report' && (
            <ReportStage
              match={match}
              myTeam={myTeam}
              userId={userId}
              onReport={report}
              onResolve={resolveConflict}
              onAdvance={() => { doDistributeMMR(); advanceStage('confirm') }}
            />
          )}
          {stage === 'confirm' && (
            <ConfirmStage match={match} myTeam={myTeam} />
          )}
        </div>

        {/* Chat panel */}
        <ChatPanel
          tab={chatTab}
          onTabChange={setChatTab}
          teamMessages={teamMessages}
          globalMessages={globalMessages}
          onSendTeam={sendTeam}
          onSendGlobal={sendGlobal}
          myTeam={myTeam}
        />
      </div>
    </div>
  )
}
