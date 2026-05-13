import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { useSiteIcons } from '@/hooks/useSiteIcons'
import { useMediaSection } from '@/hooks/useMedia'
import { ChevronRight } from 'lucide-react'

/* ── CSS vars (injected once) ── */
const CSS_VARS = `
  :root {
    --bg: #0a0a0c;
    --panel: #111116;
    --panel-2: #0e0e12;
    --line: #1e1e24;
    --muted: #8a8a93;
    --muted-2: #5a5a62;
    --red: #ef2434;
    --red-dark: #c1121f;
  }
  .rs-display { font-family: 'Rajdhani', sans-serif; }
  .rs-mono { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; }
`

/* ── SVG Logo ── */
const RushLogo = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="rl" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff3a48" />
        <stop offset="1" stopColor="#c1121f" />
      </linearGradient>
    </defs>
    <path d="M8 4 L44 4 Q56 4 56 18 Q56 28 46 32 L58 60 L42 60 L32 36 L24 36 L24 60 L8 60 Z M24 14 L24 26 L40 26 Q44 26 44 20 Q44 14 40 14 Z" fill="url(#rl)" />
  </svg>
)

/* ── Hero art SVG ── */
const HeroArt = () => (
  <svg viewBox="0 0 600 400" preserveAspectRatio="xMaxYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
    <defs>
      <radialGradient id="hg" cx="0.65" cy="0.45" r="0.7">
        <stop offset="0" stopColor="#3a0a10" stopOpacity="0.9" />
        <stop offset="0.5" stopColor="#1a0608" stopOpacity="0.6" />
        <stop offset="1" stopColor="#0a0a0c" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="hg2" x1="0" x2="1">
        <stop offset="0" stopColor="#0a0a0c" />
        <stop offset="0.4" stopColor="#0a0a0c" stopOpacity="0.85" />
        <stop offset="1" stopColor="#0a0a0c" stopOpacity="0" />
      </linearGradient>
      <pattern id="pgrid" width="22" height="22" patternUnits="userSpaceOnUse">
        <path d="M22 0 L0 0 0 22" fill="none" stroke="#2a0a10" strokeWidth="0.5" opacity="0.5" />
      </pattern>
    </defs>
    <rect width="600" height="400" fill="#15080b" />
    <rect width="600" height="400" fill="url(#pgrid)" />
    <rect width="600" height="400" fill="url(#hg)" />
    <g opacity="0.35" transform="translate(330 60)">
      <path d="M0 0 L160 0 Q220 0 220 60 Q220 110 175 130 L235 280 L160 280 L115 160 L70 160 L70 280 L0 280 Z M70 50 L70 110 L150 110 Q170 110 170 80 Q170 50 150 50 Z" fill="#ef2434" opacity="0.4" />
    </g>
    <g transform="translate(360 60)">
      <path d="M90 0 Q150 5 175 60 Q190 100 185 145 L220 200 Q235 240 230 290 L235 340 L40 340 L45 290 Q40 240 55 200 L90 145 Q85 100 100 60 Q115 5 90 0 Z" fill="#0a0608" />
      <path d="M75 80 Q110 60 165 80 Q175 110 165 140 Q140 150 105 145 Q80 130 75 80 Z" fill="#180a0d" />
      <circle cx="105" cy="105" r="6" fill="#ff3a48" />
      <circle cx="105" cy="105" r="10" fill="#ff3a48" opacity="0.3" />
      <circle cx="145" cy="105" r="6" fill="#ff3a48" />
      <circle cx="145" cy="105" r="10" fill="#ff3a48" opacity="0.3" />
      <g transform="translate(110 210) scale(0.5)" fill="#ef2434">
        <path d="M0 0 L60 0 Q80 0 80 22 Q80 38 65 46 L85 95 L60 95 L45 56 L25 56 L25 95 L0 95 Z M25 18 L25 38 L55 38 Q62 38 62 28 Q62 18 55 18 Z" />
      </g>
    </g>
    <rect width="600" height="400" fill="url(#hg2)" />
  </svg>
)

/* ── Small game logos ── */
const SmallGameLogo = ({ game }: { game: string }) => {
  if (game === 'valorant') return <svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#1a0608" /><path d="M4 8 L11 8 L16 22 L21 8 L28 8 L18 28 L14 28 Z" fill="#ef2434" /></svg>
  if (game === 'cod') return <svg viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#5a3a1a" /><text x="16" y="20" textAnchor="middle" fill="#e8c89a" fontFamily="Rajdhani" fontWeight="700" fontSize="8">CALL∙DUTY</text></svg>
  if (game === 'lol') return <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#08101e" /><circle cx="16" cy="16" r="10" fill="none" stroke="#d4b86a" strokeWidth="1.5" /><text x="16" y="21" textAnchor="middle" fill="#d4b86a" fontFamily="serif" fontWeight="700" fontSize="14" fontStyle="italic">L</text></svg>
  if (game === 'apex') return <svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#2a0608" /><polygon points="16,6 24,26 16,22 8,26" fill="#ef2434" /></svg>
  if (game === 'fortnite') return <svg viewBox="0 0 32 32"><rect width="32" height="32" rx="3" fill="#2a1245" /><text x="16" y="22" textAnchor="middle" fill="#fff" fontFamily="Rajdhani" fontWeight="700" fontSize="18">F</text></svg>
  return <svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#1a1a22" /></svg>
}

/* ── Game tile backgrounds ── */
const GameTile = ({ game }: { game: string }) => {
  const tiles: Record<string, React.ReactElement> = {
    valorant: <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}><defs><linearGradient id="v1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1a0608" /><stop offset="1" stopColor="#3a0a10" /></linearGradient></defs><rect width="200" height="200" fill="url(#v1)" /><path d="M30 50 L70 50 L100 130 L130 50 L170 50 L110 170 L90 170 Z" fill="#ef2434" /></svg>,
    cod: <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}><rect width="200" height="200" fill="#3a2418" /><rect width="200" height="200" fill="#1a0e08" opacity="0.6" /><text x="100" y="115" textAnchor="middle" fill="#e8c89a" fontFamily="Rajdhani" fontWeight="700" fontSize="34" letterSpacing="2">CALL∙DUTY</text></svg>,
    lol: <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}><defs><radialGradient id="l1" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stopColor="#1a2a4a" /><stop offset="1" stopColor="#08101e" /></radialGradient></defs><rect width="200" height="200" fill="url(#l1)" /><circle cx="100" cy="100" r="55" fill="none" stroke="#d4b86a" strokeWidth="6" /><text x="100" y="118" textAnchor="middle" fill="#d4b86a" fontFamily="serif" fontWeight="700" fontSize="58" fontStyle="italic">L</text></svg>,
    apex: <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}><defs><linearGradient id="a1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a0608" /><stop offset="1" stopColor="#1a0408" /></linearGradient></defs><rect width="200" height="200" fill="url(#a1)" /><polygon points="100,40 140,140 100,115 60,140" fill="#ef2434" /></svg>,
    fortnite: <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}><defs><linearGradient id="f1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a1a5a" /><stop offset="1" stopColor="#1a0a2a" /></linearGradient></defs><rect width="200" height="200" fill="url(#f1)" /><text x="100" y="125" textAnchor="middle" fill="#a06aff" fontFamily="Rajdhani" fontWeight="700" fontSize="80">F</text></svg>,
  }
  return tiles[game] ?? <svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#1a1a22" /></svg>
}

/* ── Seed avatar ── */
const SeedAvatar = ({ seed = 0, size = 36, ring }: { seed?: number; size?: number; ring?: string }) => {
  const palettes = [
    ['#1a0608', '#ef2434', '#ff8090'],
    ['#0a1a2a', '#3a6abf', '#a0c0ff'],
    ['#1a1a0a', '#8a8a3a', '#dfdf90'],
    ['#1a0a1a', '#7c3aed', '#c0a0ff'],
    ['#2a1a0a', '#bf6a3a', '#ffc090'],
    ['#0a1a0a', '#3aaf6a', '#90ffc0'],
  ]
  const c = palettes[seed % palettes.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: c[0], border: ring ? `2px solid ${ring}` : '2px solid #2a2a31', overflow: 'hidden', flexShrink: 0 }}>
      <svg viewBox="0 0 40 40" width="100%" height="100%">
        <rect width="40" height="40" fill={c[0]} />
        <path d="M0 30 Q20 12 40 30 L40 40 L0 40 Z" fill={c[1]} opacity="0.7" />
        <circle cx="20" cy="18" r="9" fill={c[0]} stroke={c[1]} strokeWidth="1" />
        <circle cx="16.5" cy="18" r="1.4" fill={c[2]} />
        <circle cx="23.5" cy="18" r="1.4" fill={c[2]} />
      </svg>
    </div>
  )
}

/* ── Immortal badge ── */
const ImmortalBadge = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <defs>
      <linearGradient id="ib" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff5070" />
        <stop offset="1" stopColor="#a01838" />
      </linearGradient>
    </defs>
    <path d="M20 3 L33 12 L30 32 L20 38 L10 32 L7 12 Z" fill="url(#ib)" stroke="#ff8090" strokeWidth="0.8" />
    <path d="M14 16 L20 12 L26 16 L20 28 Z" fill="#ff5070" opacity="0.8" />
    <path d="M20 12 L23 18 L20 28 L17 18 Z" fill="#fff" opacity="0.6" />
  </svg>
)

const TRACKED_GAMES = [
  { id: 'valorant', name: 'VALORANT', mmr: '3,250 MMR' },
  { id: 'cod', name: 'CALL OF DUTY', mmr: '2,850 MMR' },
  { id: 'lol', name: 'LEAGUE OF LEGENDS', mmr: '2,650 MMR' },
  { id: 'apex', name: 'APEX LEGENDS', mmr: '2,400 MMR' },
  { id: 'fortnite', name: 'FORTNITE', mmr: '2,100 MMR' },
]

const POPULAR_GAMES = [
  { id: 'valorant', name: 'VALORANT', players: '24,532 joueurs' },
  { id: 'cod', name: 'CALL OF DUTY', players: '18,102 joueurs' },
  { id: 'lol', name: 'LEAGUE OF LEGENDS', players: '16,910 joueurs' },
  { id: 'apex', name: 'APEX LEGENDS', players: '13,502 joueurs' },
  { id: 'fortnite', name: 'FORTNITE', players: '9,874 joueurs' },
]

const RANKING = [
  { rank: 1, name: 'NeyZ', mmr: '4,350 MMR', seed: 1 },
  { rank: 2, name: 'Skyline', mmr: '4,120 MMR', seed: 2 },
  { rank: 3, name: 'W4rrior', mmr: '3,980 MMR', seed: 4 },
  { rank: 4, name: 'Zerox', mmr: '3,250 MMR', seed: 0, me: true },
  { rank: 5, name: 'Kirua', mmr: '3,150 MMR', seed: 5 },
]

const ACTIVITY = [
  { name: 'NeyZ', action: 'a atteint le rang Radiant', time: 'il y a 10 min', seed: 1 },
  { name: 'Skyline', action: 'a remporté un match', time: 'il y a 25 min', seed: 2 },
  { name: 'W4rrior', action: 'a rejoint Rush Stack', time: 'il y a 1 h', seed: 4 },
]

const STEPS = ['RECHERCHE', 'JOUEURS TROUVÉS', 'CONFIRMATION', 'CHARGEMENT', 'EN MATCH']
const TOP_NAV = ['ACCUEIL', 'JEUX', 'CLASSEMENTS', 'LIGUES', 'TOURNOIS', 'BOUTIQUE']

const S: Record<string, React.CSSProperties> = {
  panel: { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10 },
  panel2: { background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 10 },
}

/* ── LOBBY (connecté) ──────────────────────────────────────────── */
function LobbyView() {
  const profile = useAuthStore(s => s.user)
  const signOut = useAuthStore(s => s.signOut)
  const navigate = useNavigate()
  const { navbarIcon } = useSiteIcons()
  const heroCharacter = useMediaSection('hero_character')

  const [activeNav, setActiveNav] = useState('ACCUEIL')
  const [selectedGame, setSelectedGame] = useState('valorant')
  const [queueActive, setQueueActive] = useState(false)
  const [queueSeconds, setQueueSeconds] = useState(0)
  const [playersFound, setPlayersFound] = useState(0)

  useEffect(() => {
    if (!queueActive) { setQueueSeconds(0); setPlayersFound(0); return }
    const t = setInterval(() => {
      setQueueSeconds(s => s + 1)
      setPlayersFound(p => Math.random() > 0.7 && p < 10 ? Math.min(p + 1, 10) : p)
    }, 1000)
    return () => clearInterval(t)
  }, [queueActive])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleSignOut = async () => { await signOut(); navigate('/') }

  /* circular timer */
  const radius = 100
  const circ = 2 * Math.PI * radius
  const progress = (queueSeconds % 45) / 45

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 300px', minHeight: '100vh', background: 'var(--bg)', color: '#e0e0e8', fontFamily: "'Inter', sans-serif" }}>

      {/* ── LEFT SIDEBAR ── */}
      <aside style={{ borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', padding: '20px 18px', gap: 20, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, overflow: 'hidden', flexShrink: 0 }}>
            {navbarIcon
              ? <img src={navbarIcon} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="logo" />
              : <RushLogo size={36} />}
          </div>
          <span className="rs-display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.04em' }}>
            <span style={{ color: '#fff' }}>RUSH</span><span style={{ color: '#ef2434' }}>STACK</span>
          </span>
        </div>

        {/* CTA */}
        <button onClick={() => setQueueActive(true)} style={{
          width: '100%', padding: '13px 16px', borderRadius: 8,
          background: 'linear-gradient(180deg, #ef2434, #c1121f)', color: '#fff',
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.06em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 6px 24px rgba(239,36,52,0.35)',
          cursor: 'pointer'
        }}>
          ⊕ LANCER UNE QUEUE
        </button>

        {/* Menu */}
        <div>
          <p className="rs-mono" style={{ color: 'var(--muted-2)', padding: '0 6px 10px' }}>MENU</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { label: 'Accueil', to: '/' },
              { label: 'Profil', to: '/profile' },
              { label: 'Amis', to: '/social' },
              { label: 'Classements', to: '/leaderboard' },
            ].map(item => (
              <Link key={item.to} to={item.to} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 6,
                background: item.to === '/' ? 'rgba(239,36,52,0.08)' : 'transparent',
                color: item.to === '/' ? '#ef2434' : '#c0c0c8',
                fontWeight: 500, fontSize: 14, textDecoration: 'none',
                position: 'relative'
              }}>
                {item.to === '/' && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, background: '#ef2434', borderRadius: 2 }} />}
                {item.label}
              </Link>
            ))}
            {(profile?.role === 'admin' || profile?.role === 'moderator') && (
              <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 6, color: '#c0c0c8', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Jeux suivis */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 6px 10px' }}>
            <p className="rs-mono" style={{ color: 'var(--muted-2)' }}>JEUX SUIVIS</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {TRACKED_GAMES.map(g => (
              <button key={g.id} onClick={() => setSelectedGame(g.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 8px', borderRadius: 6,
                background: selectedGame === g.id ? 'rgba(239,36,52,0.06)' : 'transparent',
                textAlign: 'left', cursor: 'pointer', border: 'none', width: '100%'
              }}>
                <div style={{ width: 30, height: 30, borderRadius: 5, overflow: 'hidden', flexShrink: 0 }}>
                  <SmallGameLogo game={g.id} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="rs-display" style={{ fontSize: 12, fontWeight: 600, color: '#e0e0e8', letterSpacing: '0.03em' }}>{g.name}</p>
                  <p style={{ fontSize: 10, color: 'var(--muted)' }}>{g.mmr}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Season banner */}
        <div style={{
          position: 'relative', borderRadius: 10, overflow: 'hidden',
          background: 'linear-gradient(135deg, #2a0610 0%, #0a0608 100%)',
          padding: '16px 14px', minHeight: 120, border: '1px solid #2a0a14'
        }}>
          <div style={{ position: 'relative' }}>
            <p className="rs-mono" style={{ color: '#bababa', marginBottom: 4 }}>SAISON 2</p>
            <p className="rs-display" style={{ fontSize: 22, fontWeight: 700, color: '#ef2434', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 16 }}>RECHARGED</p>
            <button style={{
              padding: '7px 12px', borderRadius: 6, background: '#ef2434', color: '#fff',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              fontFamily: "'Rajdhani', sans-serif", cursor: 'pointer'
            }}>VOIR LES RÉCOMPENSES</button>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* User + sign out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}>
          <SeedAvatar seed={0} size={34} ring="#ef2434" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.display_name || profile?.username}</p>
            <p style={{ fontSize: 10, color: 'var(--muted)' }}>@{profile?.username}</p>
          </div>
          <button onClick={handleSignOut} style={{ fontSize: 10, color: 'var(--muted-2)', cursor: 'pointer', background: 'none', border: 'none' }}>Quitter</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Top nav */}
        <header style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
          <nav style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            {TOP_NAV.map(n => (
              <button key={n} onClick={() => setActiveNav(n)} style={{
                padding: '8px 16px', position: 'relative',
                color: activeNav === n ? '#ef2434' : '#c0c0c8',
                fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: '0.08em', fontSize: 13,
                background: 'none', border: 'none', cursor: 'pointer'
              }}>
                {n}
                {activeNav === n && <span style={{ position: 'absolute', left: 14, right: 14, bottom: 0, height: 2, background: '#ef2434', borderRadius: 2 }} />}
              </button>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 1, height: 28, background: 'var(--line)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SeedAvatar seed={0} size={36} ring="#ef2434" />
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>{profile?.display_name || profile?.username}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>Immortal 3 · 3,250 MMR</p>
              </div>
            </div>
          </div>
        </header>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Hero */}
          <section style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(180deg, #14080a, #0e0608)', border: '1px solid var(--line)', minHeight: 260 }}>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%' }}>
              {heroCharacter
                ? <img src={heroCharacter} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} alt="" />
                : <HeroArt />}
            </div>
            <div style={{ position: 'relative', padding: '32px 36px', maxWidth: 560 }}>
              <p className="rs-mono" style={{ color: '#ef2434', fontWeight: 700, marginBottom: 14 }}>RUSH STACK</p>
              <h1 className="rs-display" style={{ fontSize: 42, lineHeight: 1.05, margin: '0 0 16px', fontWeight: 700, letterSpacing: '0.01em', color: '#fff' }}>
                COMPÈTE. PROGRESSE.<br />
                <span style={{ color: '#ef2434' }}>DEVIENS UNE LÉGENDE.</span>
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 400, margin: '0 0 24px' }}>
                Affronte les meilleurs joueurs, grimpe les classements et marque l'histoire dans chaque jeu.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setQueueActive(true)} style={{
                  padding: '12px 20px', borderRadius: 8,
                  background: 'linear-gradient(180deg, #ef2434, #c1121f)', color: '#fff',
                  fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.08em',
                  display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: '0 4px 18px rgba(239,36,52,0.4)', cursor: 'pointer', border: 'none'
                }}>
                  LANCER UNE QUEUE
                </button>
                <Link to="/leaderboard" style={{
                  padding: '12px 20px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)', color: '#fff',
                  border: '1px solid #3a3a42',
                  fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.08em',
                  textDecoration: 'none', display: 'flex', alignItems: 'center'
                }}>
                  VOIR LES CLASSEMENTS
                </Link>
              </div>
            </div>
          </section>

          {/* Queue panel */}
          <section style={{ ...S.panel, padding: 24 }}>
            <p className="rs-display" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 20, textTransform: 'uppercase', color: '#fff' }}>
              {queueActive ? 'File d\'attente en cours' : 'Lancement de la file d\'attente'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 16 }}>
              {/* Game info */}
              <div style={{ ...S.panel2, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid var(--line)', marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden' }}>
                    <SmallGameLogo game={selectedGame} />
                  </div>
                  <p className="rs-display" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.05em', color: '#fff' }}>{TRACKED_GAMES.find(g => g.id === selectedGame)?.name ?? 'VALORANT'}</p>
                </div>
                {[['MODE', 'COMPÉTITIF'], ['RÔLE', 'AU CHOIX'], ['RÉGION', 'EUROPE (PARIS)']].map(([l, v]) => (
                  <div key={l} style={{ padding: '10px 0', borderBottom: '1px solid #1f1f24' }}>
                    <p className="rs-mono" style={{ color: 'var(--muted)', marginBottom: 4 }}>{l}</p>
                    <p className="rs-display" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.03em', color: '#e0e0e8' }}>{v}</p>
                  </div>
                ))}
              </div>

              {/* Timer */}
              <div style={{ ...S.panel2, padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <div style={{ position: 'relative', width: 240, height: 240, display: 'grid', placeItems: 'center' }}>
                  <svg width="240" height="240" style={{ position: 'absolute', inset: 0 }}>
                    <defs>
                      <filter id="redglow"><feGaussianBlur stdDeviation="4" /></filter>
                      <linearGradient id="ringG" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#ff3a48" />
                        <stop offset="1" stopColor="#7a0814" />
                      </linearGradient>
                    </defs>
                    <circle cx="120" cy="120" r="110" fill="none" stroke="#220a10" strokeWidth="1" />
                    <circle cx="120" cy="120" r={radius} fill="none" stroke="#220a10" strokeWidth="6" />
                    <circle cx="120" cy="120" r="118" fill="none" stroke="#3a0a14" strokeWidth="1" strokeDasharray="2 6" />
                    {queueActive && <>
                      <circle cx="120" cy="120" r={radius} fill="none" stroke="url(#ringG)" strokeWidth="10"
                        strokeDasharray={`${circ * progress} ${circ}`} strokeLinecap="round"
                        transform="rotate(-90 120 120)" filter="url(#redglow)" opacity="0.7" />
                      <circle cx="120" cy="120" r={radius} fill="none" stroke="url(#ringG)" strokeWidth="4"
                        strokeDasharray={`${circ * progress} ${circ}`} strokeLinecap="round"
                        transform="rotate(-90 120 120)" />
                    </>}
                    {[...Array(60)].map((_, i) => {
                      const a = (i / 60) * Math.PI * 2 - Math.PI / 2
                      const x1 = 120 + Math.cos(a) * 122; const y1 = 120 + Math.sin(a) * 122
                      const x2 = 120 + Math.cos(a) * 126; const y2 = 120 + Math.sin(a) * 126
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3a0a14" strokeWidth={i % 5 === 0 ? 1.5 : 0.5} />
                    })}
                  </svg>
                  <div style={{ textAlign: 'center', zIndex: 1 }}>
                    <p className="rs-mono" style={{ color: 'var(--muted)', marginBottom: 8 }}>
                      {queueActive ? 'Recherche de partie' : 'Prêt à jouer'}
                    </p>
                    <p className="rs-display" style={{ fontSize: 56, fontWeight: 700, lineHeight: 1, letterSpacing: '0.02em', color: '#fff' }}>
                      {fmt(queueSeconds)}
                    </p>
                    <p className="rs-mono" style={{ color: 'var(--muted-2)', marginTop: 10 }}>Temps estimé : 00:45</p>
                  </div>
                </div>
                {queueActive
                  ? <button onClick={() => setQueueActive(false)} style={{ padding: '10px 22px', borderRadius: 6, border: '1px solid #3a3a42', color: '#c0c0c8', fontSize: 11, letterSpacing: '0.1em', fontWeight: 600, background: 'rgba(0,0,0,0.2)', fontFamily: "'Rajdhani', sans-serif", cursor: 'pointer' }}>ANNULER LA RECHERCHE</button>
                  : <button onClick={() => setQueueActive(true)} style={{ padding: '10px 22px', borderRadius: 6, background: '#ef2434', color: '#fff', fontSize: 11, letterSpacing: '0.1em', fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", cursor: 'pointer', boxShadow: '0 4px 16px rgba(239,36,52,0.4)' }}>TROUVER UNE PARTIE</button>
                }
              </div>

              {/* MMR info */}
              <div style={{ ...S.panel2, padding: 18 }}>
                <p className="rs-mono" style={{ color: 'var(--muted)', marginBottom: 10 }}>MMR ACTUEL</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
                  <ImmortalBadge size={42} />
                  <div>
                    <p className="rs-display" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.04em', color: '#fff' }}>IMMORTAL 3</p>
                    <p className="rs-display" style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>3,250</p>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <p className="rs-mono" style={{ color: 'var(--muted)', marginBottom: 6 }}>PLAGE MMR</p>
                  <p className="rs-display" style={{ fontSize: 16, fontWeight: 600, color: '#e0e0e8' }}>3,150 — 3,350</p>
                </div>
                <div>
                  <p className="rs-mono" style={{ color: 'var(--muted)', marginBottom: 6 }}>JOUEURS TROUVÉS</p>
                  <p className="rs-display" style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                    <span style={{ color: '#ef2434' }}>{playersFound}</span> / 10
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', alignItems: 'start', position: 'relative' }}>
              {STEPS.map((step, i) => (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  {i < STEPS.length - 1 && (
                    <div style={{ position: 'absolute', top: 22, left: 'calc(50% + 24px)', right: 'calc(-50% + 24px)', height: 1, background: 'repeating-linear-gradient(90deg, #3a3a42 0 4px, transparent 4px 8px)' }} />
                  )}
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%',
                    border: i === 0 && queueActive ? '1.5px solid #ef2434' : '1px solid #2a2a31',
                    background: i === 0 && queueActive ? 'rgba(239,36,52,0.08)' : '#0e0e12',
                    display: 'grid', placeItems: 'center',
                    color: i === 0 && queueActive ? '#ef2434' : '#5a5a62',
                    boxShadow: i === 0 && queueActive ? '0 0 20px rgba(239,36,52,0.3)' : 'none',
                    position: 'relative', zIndex: 1, fontSize: 16
                  }}>
                    {i === 0 ? '◎' : i === 1 ? '◉' : i === 2 ? '✓' : i === 3 ? '⟳' : '⚔'}
                  </div>
                  <p className="rs-mono" style={{ marginTop: 10, color: i === 0 && queueActive ? '#fff' : '#6a6a72', fontWeight: 600, textAlign: 'center' }}>{step}</p>
                  {i === 0 && queueActive && <p style={{ fontSize: 10, color: '#ef2434', marginTop: 2 }}>En cours</p>}
                </div>
              ))}
            </div>
          </section>

          {/* Popular games */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <p className="rs-display" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>Jeux populaires</p>
              <button className="rs-mono" style={{ color: '#ef2434', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>VOIR TOUS LES JEUX</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
              {POPULAR_GAMES.map(g => (
                <div key={g.id} style={{ ...S.panel, overflow: 'hidden', cursor: 'pointer', transition: 'transform .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = '#ef2434' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)' }}>
                  <div style={{ aspectRatio: '4/3', position: 'relative' }}>
                    <GameTile game={g.id} />
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p className="rs-display" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', color: '#fff' }}>{g.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{g.players}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* ── RIGHT SIDEBAR ── */}
      <aside style={{ borderLeft: '1px solid var(--line)', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>

        {/* Profile */}
        <div style={{ ...S.panel, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <SeedAvatar seed={0} size={54} ring="#ef2434" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p className="rs-display" style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{profile?.display_name || profile?.username}</p>
              </div>
              <div style={{ fontSize: 11, color: '#28d17c', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#28d17c', flexShrink: 0 }} /> En ligne
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', marginBottom: 12 }}>
            <ImmortalBadge size={36} />
            <div>
              <p className="rs-display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', color: '#fff' }}>IMMORTAL 3</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>3,250 MMR</p>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ height: 4, background: '#26262c', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #c1121f, #ef2434)' }} />
            </div>
            <p style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'right', marginTop: 4 }}>3,250 / 3,500</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 }}>
            {[['MATCHS', '1,248'], ['VICTOIRES', '712'], ['WINRATE', '57%']].map(([l, v]) => (
              <div key={l}>
                <p className="rs-mono" style={{ color: 'var(--muted)', marginBottom: 4, fontSize: 9 }}>{l}</p>
                <p className="rs-display" style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking */}
        <div style={{ ...S.panel, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <p className="rs-mono" style={{ fontWeight: 700, color: '#e0e0e8' }}>CLASSEMENT GLOBAL</p>
            <Link to="/leaderboard" className="rs-mono" style={{ color: '#ef2434', fontWeight: 700, fontSize: 9, textDecoration: 'none' }}>VOIR TOUT</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RANKING.map(r => (
              <div key={r.rank} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <p className="rs-display" style={{ width: 24, fontSize: 12, fontWeight: 700, color: r.rank <= 3 ? '#ef2434' : '#8a8a93' }}>#{r.rank}</p>
                <SeedAvatar seed={r.seed} size={28} />
                <p style={{ flex: 1, fontSize: 12, fontWeight: r.me ? 700 : 500, color: r.me ? '#fff' : '#c0c0c8' }}>{r.name}</p>
                <p className="rs-display" style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{r.mmr}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div style={{ ...S.panel, padding: 18 }}>
          <p className="rs-mono" style={{ fontWeight: 700, marginBottom: 14, color: '#e0e0e8' }}>ACTIVITÉ RÉCENTE</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <SeedAvatar seed={a.seed} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#e0e0e8' }}>{a.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.3 }}>{a.action}</p>
                  <p style={{ fontSize: 10, color: 'var(--muted-2)', marginTop: 2 }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}

/* ── LANDING (non connecté) ────────────────────────────────────── */
function LandingView() {
  const { navbarIcon } = useSiteIcons()
  const heroCharacter = useMediaSection('hero_character')
  const STATS = [
    { value: '128K+', label: 'JOUEURS ACTIFS' },
    { value: '2.4M+', label: 'MATCHS JOUÉS' },
    { value: '58', label: 'JEUX SUPPORTÉS' },
    { value: '24/7', label: 'SUPPORT ACTIF' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#e0e0e8', fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: 64, background: 'rgba(10,10,12,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, overflow: 'hidden' }}>
            {navbarIcon ? <img src={navbarIcon} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="logo" /> : <RushLogo size={32} />}
          </div>
          <span className="rs-display" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.04em' }}>
            <span style={{ color: '#fff' }}>RUSH</span><span style={{ color: '#ef2434' }}>STACK</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['ACCUEIL', 'JEUX', 'CLASSEMENTS', 'LIGUES', 'COMMUNAUTÉ', 'À PROPOS'].map(n => (
            <button key={n} className="rs-display" style={{ padding: '8px 16px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', background: 'none', border: 'none', cursor: 'pointer' }}>{n}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/login" className="rs-display" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textDecoration: 'none' }}>SE CONNECTER</Link>
          <Link to="/register" style={{ padding: '9px 18px', background: '#ef2434', color: '#fff', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.08em', borderRadius: 6, textDecoration: 'none' }}>S'INSCRIRE</Link>
        </div>
      </nav>

      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 64 }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0a0a0c, rgba(10,10,12,0.8) 40%, transparent)' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%' }}>
            {heroCharacter
              ? <img src={heroCharacter} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} alt="" />
              : <HeroArt />}
          </div>
        </div>
        <div style={{ position: 'relative', padding: '0 64px', maxWidth: 680 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ height: 1, width: 32, background: '#ef2434' }} />
            <p className="rs-mono" style={{ color: '#ef2434', fontWeight: 700 }}>LA COMPÉTITION COMMENCE ICI /</p>
            <div style={{ height: 1, width: 32, background: '#ef2434' }} />
          </div>
          <h1 className="rs-display" style={{ fontSize: 88, lineHeight: 1, marginBottom: 24, fontWeight: 700 }}>
            <span style={{ color: '#fff', display: 'block' }}>JOUE.</span>
            <span style={{ color: '#fff', display: 'block' }}>COMPÈTE.</span>
            <span style={{ color: '#ef2434', display: 'block' }}>MONTE EN</span>
            <span style={{ color: '#ef2434', display: 'block' }}>RANK.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, lineHeight: 1.7, maxWidth: 480, marginBottom: 36 }}>
            Rush Stack est la plateforme ultime de matchmaking multi-jeux. Affronte les meilleurs, grimpe les classements et deviens une légende.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', background: '#ef2434', color: '#fff', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', borderRadius: 8, textDecoration: 'none', boxShadow: '0 0 30px rgba(239,36,52,0.4)' }}>
              COMMENCER <ChevronRight size={16} />
            </Link>
            <button style={{ padding: '14px 24px', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', borderRadius: 8, background: 'none', cursor: 'pointer' }}>
              VOIR LES JEUX
            </button>
          </div>
        </div>
        {/* Floating stats */}
        <div style={{ position: 'absolute', right: '30%', top: '35%' }}>
          <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 18px' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Win Rate</p>
            <p style={{ color: '#28d17c', fontWeight: 900, fontSize: 16 }}>+58.3%</p>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '10%', bottom: '35%' }}>
          <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 18px' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>MMR</p>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>3,480</p>
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,0.02)', padding: '24px 64px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
        {STATS.map(({ value, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef2434', flexShrink: 0 }} />
            <div>
              <p className="rs-display" style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{value}</p>
              <p className="rs-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '24px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="rs-display" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.04em' }}>
          <span style={{ color: '#fff' }}>RUSH</span><span style={{ color: '#ef2434' }}>STACK</span>
        </span>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2026 Rush Stack. Tous droits réservés.</p>
      </footer>
    </div>
  )
}

/* ── SMART HOME ──────────────────────────────────────────────────── */
export default function UnifiedHomePage() {
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = CSS_VARS
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p className="rs-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 20 }}>
          <span style={{ color: '#fff' }}>RUSH</span><span style={{ color: '#ef2434' }}>STACK</span>
        </p>
        <div style={{ width: 32, height: 32, border: '2px solid #ef2434', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      </div>
    </div>
  )

  return isAuthenticated ? <LobbyView /> : <LandingView />
}
