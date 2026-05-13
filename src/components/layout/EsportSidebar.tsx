import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { useSiteIcons } from '@/hooks/useSiteIcons'
import { SeedAvatar, SmallGameLogo } from '@/components/esport/EsportUI'

const RushLogo = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="rl-sb" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff3a48" />
        <stop offset="1" stopColor="#c1121f" />
      </linearGradient>
    </defs>
    <path d="M8 4 L44 4 Q56 4 56 18 Q56 28 46 32 L58 60 L42 60 L32 36 L24 36 L24 60 L8 60 Z M24 14 L24 26 L40 26 Q44 26 44 20 Q44 14 40 14 Z" fill="url(#rl-sb)" />
  </svg>
)

const TRACKED_GAMES = [
  { id: 'valorant', name: 'VALORANT',          mmr: '3,250 MMR' },
  { id: 'cod',      name: 'CALL OF DUTY',       mmr: '2,850 MMR' },
  { id: 'lol',      name: 'LEAGUE OF LEGENDS',  mmr: '2,650 MMR' },
  { id: 'apex',     name: 'APEX LEGENDS',       mmr: '2,400 MMR' },
  { id: 'fortnite', name: 'FORTNITE',           mmr: '2,100 MMR' },
]

const NAV_LINKS = [
  { label: 'Accueil',      to: '/' },
  { label: 'Profil',       to: '/profile' },
  { label: 'Amis',         to: '/social' },
  { label: 'Classements',  to: '/leaderboard' },
]

export default function EsportSidebar() {
  const profile = useAuthStore(s => s.user)
  const signOut = useAuthStore(s => s.signOut)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { navbarIcon } = useSiteIcons()

  const handleSignOut = async () => { await signOut(); navigate('/') }

  const isActive = (to: string) => to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <aside style={{
      width: 260, flexShrink: 0,
      borderRight: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 18px', gap: 20,
      position: 'sticky', top: 0, height: '100vh',
      overflowY: 'auto', background: 'var(--bg)',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, overflow: 'hidden', flexShrink: 0 }}>
          {navbarIcon
            ? <img src={navbarIcon} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="logo" />
            : <RushLogo size={36} />}
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.04em', fontFamily: "'Rajdhani', sans-serif" }}>
          <span style={{ color: '#fff' }}>RUSH</span><span style={{ color: '#ef2434' }}>STACK</span>
        </span>
      </div>

      {/* CTA */}
      <Link to="/play" style={{
        width: '100%', padding: '13px 16px', borderRadius: 8,
        background: 'linear-gradient(180deg, #ef2434, #c1121f)', color: '#fff',
        fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.06em',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        boxShadow: '0 6px 24px rgba(239,36,52,0.35)',
        textDecoration: 'none',
      }}>
        ⊕ LANCER UNE QUEUE
      </Link>

      {/* Menu */}
      <div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', padding: '0 6px 10px' }}>MENU</p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_LINKS.map(item => {
            const active = isActive(item.to)
            return (
              <Link key={item.to} to={item.to} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 6,
                background: active ? 'rgba(239,36,52,0.08)' : 'transparent',
                color: active ? '#ef2434' : '#c0c0c8',
                fontWeight: 500, fontSize: 14, textDecoration: 'none',
                position: 'relative',
              }}>
                {active && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, background: '#ef2434', borderRadius: 2 }} />}
                {item.label}
              </Link>
            )
          })}
          {(profile?.role === 'admin' || profile?.role === 'moderator') && (
            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 6, color: pathname.startsWith('/admin') ? '#ef2434' : '#c0c0c8', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>
              Admin
            </Link>
          )}
        </nav>
      </div>

      {/* Jeux suivis */}
      <div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', padding: '0 6px 10px' }}>JEUX SUIVIS</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TRACKED_GAMES.map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 6 }}>
              <div style={{ width: 30, height: 30, borderRadius: 5, overflow: 'hidden', flexShrink: 0 }}>
                <SmallGameLogo game={g.id} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 600, color: '#e0e0e8', letterSpacing: '0.03em' }}>{g.name}</p>
                <p style={{ fontSize: 10, color: 'var(--muted)' }}>{g.mmr}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Season banner */}
      <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: 'linear-gradient(135deg, #2a0610 0%, #0a0608 100%)', padding: '16px 14px', border: '1px solid #2a0a14' }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bababa', marginBottom: 4 }}>SAISON 2</p>
        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: '#ef2434', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 16 }}>RECHARGED</p>
        <button style={{ padding: '7px 12px', borderRadius: 6, background: '#ef2434', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', fontFamily: "'Rajdhani', sans-serif", cursor: 'pointer', border: 'none' }}>
          VOIR LES RÉCOMPENSES
        </button>
      </div>

      <div style={{ flex: 1 }} />

      {/* User footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}>
        <SeedAvatar seed={0} size={34} ring="#ef2434" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile?.display_name || profile?.username}
          </p>
          <p style={{ fontSize: 10, color: 'var(--muted)' }}>@{profile?.username}</p>
        </div>
        <button onClick={handleSignOut} style={{ fontSize: 10, color: 'var(--muted-2)', cursor: 'pointer', background: 'none', border: 'none', flexShrink: 0 }}>Quitter</button>
      </div>
    </aside>
  )
}
