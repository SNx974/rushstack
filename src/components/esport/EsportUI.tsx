import React from 'react'

export const S: Record<string, React.CSSProperties> = {
  panel: { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10 },
  panel2: { background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 10 },
}

export const SeedAvatar = ({ seed = 0, size = 36, ring }: { seed?: number; size?: number; ring?: string | null }) => {
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

export const ImmortalBadge = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <defs>
      <linearGradient id="ib-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff5070" />
        <stop offset="1" stopColor="#a01838" />
      </linearGradient>
    </defs>
    <path d="M20 3 L33 12 L30 32 L20 38 L10 32 L7 12 Z" fill="url(#ib-grad)" stroke="#ff8090" strokeWidth="0.8" />
    <path d="M14 16 L20 12 L26 16 L20 28 Z" fill="#ff5070" opacity="0.8" />
    <path d="M20 12 L23 18 L20 28 L17 18 Z" fill="#fff" opacity="0.6" />
  </svg>
)

const RANK_COLORS: Record<string, [string, string]> = {
  RADIANT:    ['#fffbe8', '#d4b86a'],
  IRIDESCENT: ['#d0b0ff', '#8040c0'],
  IMMORTAL:   ['#ff5070', '#a01838'],
  CHALLENGER: ['#d4b86a', '#8a6020'],
  GRANDMASTER:['#ff8060', '#c04030'],
  APEX:       ['#ef2434', '#a01020'],
  MASTER:     ['#c090ff', '#6040a0'],
  CHAMPION:   ['#60d0ff', '#2080a0'],
  CRIMSON:    ['#ff6060', '#c02020'],
  DIAMOND:    ['#a0c0ff', '#3a6abf'],
  PLATINUM:   ['#90ffc0', '#3aaf6a'],
  GOLD:       ['#ffc090', '#bf6a3a'],
  SILVER:     ['#d0d0d8', '#7a7a86'],
  BRONZE:     ['#e8c89a', '#8a6040'],
}

export const RankBadge = ({ rank, size = 36 }: { rank: string; size?: number }) => {
  const key = Object.keys(RANK_COLORS).find(k => rank.toUpperCase().startsWith(k)) ?? 'BRONZE'
  const [light, dark] = RANK_COLORS[key]
  const id = `rb-${key}`
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      <path d="M20 3 L33 12 L30 32 L20 38 L10 32 L7 12 Z" fill={`url(#${id})`} stroke={light} strokeWidth="0.6" opacity="0.85" />
      <path d="M14 16 L20 12 L26 16 L20 26 Z" fill={light} opacity="0.7" />
    </svg>
  )
}

export const SmallGameLogo = ({ game }: { game: string }) => {
  if (game === 'valorant') return (
    <svg viewBox="0 0 32 32" width="100%" height="100%">
      <rect width="32" height="32" fill="#1a0608" />
      <path d="M4 8 L11 8 L16 22 L21 8 L28 8 L18 28 L14 28 Z" fill="#ef2434" />
    </svg>
  )
  if (game === 'cod') return (
    <svg viewBox="0 0 32 32" width="100%" height="100%">
      <rect width="32" height="32" rx="3" fill="#5a3a1a" />
      <text x="16" y="13" textAnchor="middle" fill="#e8c89a" fontFamily="Rajdhani,sans-serif" fontWeight="700" fontSize="6">CALL OF</text>
      <text x="16" y="22" textAnchor="middle" fill="#e8c89a" fontFamily="Rajdhani,sans-serif" fontWeight="700" fontSize="7">DUTY</text>
    </svg>
  )
  if (game === 'lol') return (
    <svg viewBox="0 0 32 32" width="100%" height="100%">
      <circle cx="16" cy="16" r="16" fill="#08101e" />
      <circle cx="16" cy="16" r="11" fill="none" stroke="#d4b86a" strokeWidth="1.5" />
      <text x="16" y="21" textAnchor="middle" fill="#d4b86a" fontFamily="serif" fontWeight="700" fontSize="14" fontStyle="italic">L</text>
    </svg>
  )
  if (game === 'apex') return (
    <svg viewBox="0 0 32 32" width="100%" height="100%">
      <rect width="32" height="32" fill="#2a0608" />
      <polygon points="16,6 24,26 16,22 8,26" fill="#ef2434" />
    </svg>
  )
  if (game === 'fortnite') return (
    <svg viewBox="0 0 32 32" width="100%" height="100%">
      <rect width="32" height="32" rx="3" fill="#2a1245" />
      <text x="16" y="22" textAnchor="middle" fill="#a06aff" fontFamily="Rajdhani,sans-serif" fontWeight="700" fontSize="18">F</text>
    </svg>
  )
  return <svg viewBox="0 0 32 32" width="100%" height="100%"><rect width="32" height="32" fill="#1a1a22" /></svg>
}
