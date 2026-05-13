import { useState, useMemo, useRef, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { SeedAvatar, SmallGameLogo } from '@/components/esport/EsportUI'

const GAMES = [
  { id: 'all',      label: 'TOUS LES JEUX' },
  { id: 'valorant', label: 'VALORANT' },
  { id: 'cod',      label: 'CALL OF DUTY' },
  { id: 'lol',      label: 'LEAGUE OF LEGENDS' },
  { id: 'apex',     label: 'APEX LEGENDS' },
  { id: 'fortnite', label: 'FORTNITE' },
]

const ALL_PLAYERS = [
  { rank: 1,  name: 'NeyZ',     mmr: 4350, game: 'valorant', rank_t: 'RADIANT',        wr: 68, wins: 1840, change: 12,  status: 'online',  seed: 1, tag: 'FR' },
  { rank: 2,  name: 'Skyline',  mmr: 4120, game: 'cod',      rank_t: 'IRIDESCENT',     wr: 64, wins: 1502, change: 4,   status: 'online',  seed: 2, tag: 'DE' },
  { rank: 3,  name: 'W4rrior',  mmr: 3980, game: 'apex',     rank_t: 'APEX PREDATOR',  wr: 61, wins: 1320, change: -2,  status: 'ingame',  seed: 4, tag: 'UK' },
  { rank: 4,  name: 'Zerox',    mmr: 3250, game: 'valorant', rank_t: 'IMMORTAL 3',     wr: 57, wins: 712,  change: 3,   status: 'online',  seed: 0, tag: 'FR', me: true },
  { rank: 5,  name: 'Kirua',    mmr: 3150, game: 'lol',      rank_t: 'CHALLENGER',     wr: 58, wins: 980,  change: 1,   status: 'online',  seed: 5, tag: 'IT' },
  { rank: 6,  name: 'Phantom',  mmr: 3120, game: 'valorant', rank_t: 'IMMORTAL 3',     wr: 56, wins: 642,  change: -1,  status: 'offline', seed: 3, tag: 'ES' },
  { rank: 7,  name: 'Bl4ze',    mmr: 3080, game: 'cod',      rank_t: 'CRIMSON 3',      wr: 55, wins: 891,  change: 5,   status: 'ingame',  seed: 2, tag: 'FR' },
  { rank: 8,  name: 'Vortex',   mmr: 3020, game: 'apex',     rank_t: 'MASTER',         wr: 60, wins: 1124, change: 2,   status: 'online',  seed: 4, tag: 'NL' },
  { rank: 9,  name: 'Nyx',      mmr: 2980, game: 'fortnite', rank_t: 'CHAMPION',       wr: 52, wins: 1450, change: 7,   status: 'online',  seed: 5, tag: 'BE' },
  { rank: 10, name: 'Sh4dow',   mmr: 2950, game: 'valorant', rank_t: 'IMMORTAL 2',     wr: 54, wins: 580,  change: -3,  status: 'offline', seed: 1, tag: 'FR' },
  { rank: 11, name: 'Glitch',   mmr: 2910, game: 'lol',      rank_t: 'GRANDMASTER',    wr: 56, wins: 1050, change: 0,   status: 'online',  seed: 0, tag: 'DE' },
  { rank: 12, name: 'Reaper',   mmr: 2880, game: 'cod',      rank_t: 'CRIMSON 2',      wr: 53, wins: 720,  change: 8,   status: 'ingame',  seed: 3, tag: 'UK' },
  { rank: 13, name: 'Aurora',   mmr: 2840, game: 'valorant', rank_t: 'IMMORTAL 2',     wr: 58, wins: 615,  change: -5,  status: 'online',  seed: 2, tag: 'SE' },
  { rank: 14, name: 'Specter',  mmr: 2810, game: 'apex',     rank_t: 'MASTER',         wr: 51, wins: 890,  change: 1,   status: 'offline', seed: 4, tag: 'PL' },
  { rank: 15, name: 'Frost',    mmr: 2780, game: 'fortnite', rank_t: 'CHAMPION',       wr: 49, wins: 1280, change: 3,   status: 'online',  seed: 5, tag: 'NO' },
  { rank: 16, name: 'Echo',     mmr: 2750, game: 'lol',      rank_t: 'GRANDMASTER',    wr: 55, wins: 920,  change: -2,  status: 'online',  seed: 1, tag: 'FR' },
  { rank: 17, name: 'Riven',    mmr: 2720, game: 'valorant', rank_t: 'IMMORTAL 1',     wr: 52, wins: 460,  change: 6,   status: 'ingame',  seed: 0, tag: 'PT' },
  { rank: 18, name: 'Krypton',  mmr: 2690, game: 'cod',      rank_t: 'CRIMSON 1',      wr: 50, wins: 680,  change: 0,   status: 'offline', seed: 2, tag: 'IT' },
  { rank: 19, name: 'Voidx',    mmr: 2660, game: 'apex',     rank_t: 'DIAMOND 1',      wr: 54, wins: 750,  change: -1,  status: 'online',  seed: 3, tag: 'DE' },
  { rank: 20, name: 'Tempest',  mmr: 2630, game: 'fortnite', rank_t: 'CHAMPION',       wr: 47, wins: 1180, change: 4,   status: 'online',  seed: 4, tag: 'FR' },
]

const STATUS_COLORS: Record<string, string> = { online: '#28d17c', ingame: '#ffd860', offline: '#5a5a62' }
const STATUS_LABELS: Record<string, string> = { online: 'En ligne', ingame: 'En match', offline: 'Hors ligne' }
const GAME_NAMES: Record<string, string> = { valorant: 'VALORANT', cod: 'COD', lol: 'LOL', apex: 'APEX', fortnite: 'FORTNITE' }

/* ── Select dropdown ── */
function SelectChip({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 11, fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <span style={{ color: '#5a5a62' }}>{label}:</span> {value}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3 L5 7 L8 3" stroke="#8a8a93" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '110%', right: 0, zIndex: 10, background: '#1a1a20', border: '1px solid var(--line)', borderRadius: 6, padding: 4, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          {options.map(o => (
            <button key={o} onClick={() => { onChange(o); setOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 4, border: 'none', background: o === value ? 'rgba(239,36,52,0.1)' : 'transparent', color: o === value ? '#ef2434' : '#c0c0c8', fontSize: 12, fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, cursor: 'pointer' }}>{o}</button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Podium card ── */
function PodiumCard({ player, place }: { player: typeof ALL_PLAYERS[0]; place: number }) {
  const colors = [
    { ring: '#ffd860', glow: 'rgba(255,216,96,0.4)', label: '#ffd860', height: 240, scale: 1.05 },
    { ring: '#c8c8d0', glow: 'rgba(200,200,208,0.3)', label: '#c8c8d0', height: 210, scale: 1.0 },
    { ring: '#cd7f32', glow: 'rgba(205,127,50,0.3)',   label: '#cd7f32', height: 200, scale: 1.0 },
  ][place - 1]

  return (
    <div style={{ position: 'relative', background: 'linear-gradient(180deg, var(--panel), var(--panel-2))', border: '1px solid var(--line)', borderRadius: 12, padding: '22px 18px', minHeight: colors.height, textAlign: 'center', transform: `scale(${colors.scale})`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 200, height: 100, background: `radial-gradient(ellipse at center, ${colors.glow}, transparent 70%)` }} />
      <p className="rs-display" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontSize: 140, fontWeight: 700, color: 'rgba(255,255,255,0.02)', lineHeight: 0.9, pointerEvents: 'none' }}>{place}</p>

      <div style={{ position: 'relative' }}>
        <div className="rs-display" style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 4, background: place === 1 ? 'linear-gradient(180deg, #ffd860, #c89020)' : place === 2 ? '#c8c8d0' : '#cd7f32', color: '#0a0a0c', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 18 }}>#{place} · TOP {place}</div>

        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
          {place === 1 && (
            <svg width="48" height="36" viewBox="0 0 48 36" style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)' }}>
              <path d="M4 30 L4 8 L12 16 L24 4 L36 16 L44 8 L44 30 Z" fill="#ffd860" stroke="#c89020" strokeWidth="1" />
              <circle cx="24" cy="4" r="2" fill="#ef2434" />
            </svg>
          )}
          <div style={{ width: place === 1 ? 90 : 78, height: place === 1 ? 90 : 78, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.ring}, ${colors.ring}66)`, padding: 3, boxShadow: `0 0 30px ${colors.glow}` }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
              <SeedAvatar seed={player.seed} size={place === 1 ? 86 : 74} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
          <p className="rs-display" style={{ fontSize: place === 1 ? 24 : 20, fontWeight: 700, letterSpacing: '0.02em' }}>{player.name}</p>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#ef2434" /><path d="M4.5 8 L7 10.5 L11.5 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 16, height: 16, borderRadius: 3, overflow: 'hidden', display: 'inline-block' }}><SmallGameLogo game={player.game} /></span>
          {player.rank_t} · {player.tag}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: 14, borderTop: '1px solid var(--line)' }}>
          {[['MMR', player.mmr.toLocaleString(), '#ef2434'], ['WINRATE', `${player.wr}%`, '#fff'], ['VICTOIRES', player.wins.toLocaleString(), '#fff']].map(([l, v, c]) => (
            <div key={l}>
              <p className="rs-mono" style={{ color: 'var(--muted)', marginBottom: 4 }}>{l}</p>
              <p className="rs-display" style={{ fontSize: 18, fontWeight: 700, color: c as string }}>{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Player row ── */
function PlayerRow({ player }: { player: typeof ALL_PLAYERS[0] }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'grid', gridTemplateColumns: '60px 2.2fr 1.3fr 1.4fr 0.9fr 0.9fr 0.7fr 0.9fr', padding: '12px 14px', borderBottom: '1px solid #1f1f24', alignItems: 'center', background: player.me ? 'linear-gradient(90deg, rgba(239,36,52,0.08), rgba(239,36,52,0.02))' : hovered ? 'rgba(255,255,255,0.02)' : 'transparent', borderLeft: player.me ? '2px solid #ef2434' : '2px solid transparent', transition: 'background 0.15s' }}>

      <p className="rs-display" style={{ fontSize: 14, fontWeight: 700, color: '#8a8a93' }}>#{player.rank}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <SeedAvatar seed={player.seed} size={32} ring={player.me ? '#ef2434' : null} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 13, fontWeight: player.me ? 700 : 600, color: '#e0e0e8' }}>{player.name}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.5" fill="#ef2434" /><path d="M3.5 6 L5.2 7.8 L8.5 4.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ fontSize: 9, color: '#5a5a62', padding: '1px 5px', border: '1px solid #2a2a31', borderRadius: 3 }}>{player.tag}</span>
          </div>
          <p style={{ fontSize: 10, color: 'var(--muted)' }}>{player.wins.toLocaleString()} victoires</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}><SmallGameLogo game={player.game} /></div>
        <span className="rs-display" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>{GAME_NAMES[player.game]}</span>
      </div>

      <p className="rs-display" style={{ fontSize: 12, fontWeight: 600, color: '#ef2434', letterSpacing: '0.03em' }}>{player.rank_t}</p>

      <p className="rs-display" style={{ fontSize: 14, fontWeight: 700 }}>{player.mmr.toLocaleString()}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#e0e0e8' }}>{player.wr}%</span>
        <div style={{ flex: 1, maxWidth: 50, height: 3, background: '#26262c', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${player.wr}%`, height: '100%', background: player.wr >= 55 ? '#28d17c' : '#ef2434' }} />
        </div>
      </div>

      <p className="rs-display" style={{ fontSize: 12, fontWeight: 700, color: player.change > 0 ? '#28d17c' : player.change < 0 ? '#ef2434' : '#8a8a93', display: 'flex', alignItems: 'center', gap: 4 }}>
        {player.change > 0 ? '↑' : player.change < 0 ? '↓' : '–'} {Math.abs(player.change)}
      </p>

      <div style={{ textAlign: 'right', fontSize: 11, color: STATUS_COLORS[player.status], display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[player.status], display: 'inline-block' }} />
        {STATUS_LABELS[player.status]}
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const profile = useAuthStore(s => s.user)
  const [gameFilter, setGameFilter] = useState('all')
  const [region, setRegion] = useState('EU')
  const [season, setSeason] = useState('S2 - Recharged')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() =>
    ALL_PLAYERS
      .filter(p => gameFilter === 'all' || p.game === gameFilter)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [gameFilter, search]
  )

  const top3 = filtered.slice(0, 3)
  const rest = filtered.slice(3)
  const me = ALL_PLAYERS.find(p => p.me)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#e0e0e8', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* ── HEADER BANNER ── */}
        <section style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(180deg, #14080a, #0e0608)', border: '1px solid var(--line)', padding: '28px 32px' }}>
          <svg viewBox="0 0 600 120" preserveAspectRatio="xMaxYMid slice" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', opacity: 0.5 }}>
            <defs>
              <radialGradient id="lbg" cx="0.7" cy="0.5" r="0.7">
                <stop offset="0" stopColor="#3a0a14" stopOpacity="0.8" />
                <stop offset="1" stopColor="#0a0608" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="600" height="120" fill="url(#lbg)" />
            <g transform="translate(440 25)" fill="#ef2434" opacity="0.3">
              <path d="M30 0 L80 0 L80 30 Q80 55 55 65 L55 80 L75 90 L75 95 L35 95 L35 90 L55 80 L55 65 Q30 55 30 30 Z" />
              <path d="M30 10 L15 10 L15 25 Q15 40 30 40 M80 10 L95 10 L95 25 Q95 40 80 40" fill="none" stroke="#ef2434" strokeWidth="3" />
            </g>
          </svg>
          <div style={{ position: 'relative' }}>
            <p className="rs-mono" style={{ color: '#ef2434', fontWeight: 700, marginBottom: 10 }}>CLASSEMENTS</p>
            <h1 className="rs-display" style={{ fontSize: 38, fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.02em' }}>HALL OF <span style={{ color: '#ef2434' }}>LEGENDS</span></h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Les meilleurs joueurs de Rush Stack · Mise à jour il y a 2 min</p>
          </div>
        </section>

        {/* ── FILTERS ── */}
        <section style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: 18, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {GAMES.map(g => {
              const active = gameFilter === g.id
              return (
                <button key={g.id} onClick={() => { setGameFilter(g.id); setPage(1) }} style={{ padding: '8px 14px', borderRadius: 6, border: active ? 'none' : '1px solid var(--line)', background: active ? 'linear-gradient(180deg, #ef2434, #c1121f)' : 'rgba(255,255,255,0.02)', color: active ? '#fff' : '#c0c0c8', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', fontFamily: "'Rajdhani', sans-serif", display: 'flex', alignItems: 'center', gap: 6, boxShadow: active ? '0 2px 12px rgba(239,36,52,0.3)' : 'none', cursor: 'pointer' }}>
                  {g.id !== 'all' && <div style={{ width: 16, height: 16, borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}><SmallGameLogo game={g.id} /></div>}
                  {g.label}
                </button>
              )
            })}
          </div>
          <div style={{ flex: 1 }} />
          <SelectChip value={region} onChange={setRegion} options={['EU', 'NA', 'ASIA', 'GLOBAL']} label="RÉGION" />
          <SelectChip value={season} onChange={setSeason} options={['S2 - Recharged', 'S1 - Origins']} label="SAISON" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'rgba(0,0,0,0.2)', minWidth: 200 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8a93" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un joueur..." style={{ flex: 1, padding: '8px 0', background: 'transparent', border: 'none', color: '#fff', fontSize: 12, outline: 'none', fontFamily: "'Inter', sans-serif" }} />
          </div>
        </section>

        {/* ── PODIUM ── */}
        {top3.length === 3 && (
          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 14, alignItems: 'end' }}>
            <PodiumCard player={top3[1]} place={2} />
            <PodiumCard player={top3[0]} place={1} />
            <PodiumCard player={top3[2]} place={3} />
          </section>
        )}

        {/* ── TABLE ── */}
        <section style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <p className="rs-display" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Classement complet</p>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>{filtered.length} joueurs trouvés</p>
          </div>

          <div className="rs-mono" style={{ display: 'grid', gridTemplateColumns: '60px 2.2fr 1.3fr 1.4fr 0.9fr 0.9fr 0.7fr 0.9fr', color: 'var(--muted-2)', padding: '0 14px 12px', borderBottom: '1px solid var(--line)' }}>
            <span>RANG</span><span>JOUEUR</span><span>JEU</span><span>RANG ACTUEL</span><span>MMR</span><span>WINRATE</span><span>ÉVOL.</span><span style={{ textAlign: 'right' }}>STATUT</span>
          </div>

          {rest.map(p => <PlayerRow key={p.rank} player={p} />)}

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>Page {page} sur 12</p>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} style={{ width: 30, height: 30, border: '1px solid var(--line)', borderRadius: 4, background: 'transparent', color: '#c0c0c8', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2 L4 6 L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setPage(n)} style={{ width: 30, height: 30, borderRadius: 4, border: page === n ? 'none' : '1px solid var(--line)', background: page === n ? '#ef2434' : 'transparent', color: page === n ? '#fff' : '#c0c0c8', fontSize: 12, fontWeight: 600, fontFamily: "'Rajdhani', sans-serif", cursor: 'pointer' }}>{n}</button>
              ))}
              <span style={{ alignSelf: 'center', color: '#5a5a62', padding: '0 4px' }}>...</span>
              <button onClick={() => setPage(12)} style={{ width: 30, height: 30, borderRadius: 4, border: '1px solid var(--line)', background: 'transparent', color: '#c0c0c8', fontSize: 12, fontWeight: 600, fontFamily: "'Rajdhani', sans-serif", cursor: 'pointer' }}>12</button>
              <button onClick={() => setPage(p => Math.min(12, p + 1))} style={{ width: 30, height: 30, border: '1px solid var(--line)', borderRadius: 4, background: 'transparent', color: '#c0c0c8', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2 L8 6 L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>
          </div>
        </section>

        {/* ── YOUR POSITION ── */}
        {me && (
          <section style={{ background: 'linear-gradient(90deg, rgba(239,36,52,0.15), rgba(239,36,52,0.05))', border: '1px solid rgba(239,36,52,0.4)', borderRadius: 12, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 18, boxShadow: '0 4px 20px rgba(239,36,52,0.1)' }}>
            <p className="rs-mono" style={{ color: '#ef2434', fontWeight: 700 }}>VOTRE POSITION</p>
            <p className="rs-display" style={{ fontSize: 22, fontWeight: 700, color: '#ef2434', minWidth: 50 }}>#{me.rank}</p>
            <div style={{ width: 1, height: 32, background: 'rgba(239,36,52,0.3)' }} />
            <SeedAvatar seed={me.seed} size={36} ring="#ef2434" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p className="rs-display" style={{ fontSize: 16, fontWeight: 700 }}>{profile?.display_name || me.name}</p>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.5" fill="#ef2434" /><path d="M4 7 L6.2 9.2 L10 5.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>{me.rank_t} · {me.mmr.toLocaleString()} MMR</p>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ textAlign: 'right' }}>
              <p className="rs-mono" style={{ color: 'var(--muted)' }}>POUR TOP 3</p>
              <p className="rs-display" style={{ fontSize: 16, fontWeight: 700 }}>+730 MMR</p>
            </div>
            <button style={{ padding: '10px 18px', borderRadius: 6, border: 'none', background: 'linear-gradient(180deg, #ef2434, #c1121f)', color: '#fff', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", boxShadow: '0 4px 16px rgba(239,36,52,0.3)', cursor: 'pointer' }}>JOUER UNE QUEUE</button>
          </section>
        )}
      </div>
    </div>
  )
}
