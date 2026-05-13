import { useState, useMemo } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { SeedAvatar, ImmortalBadge, SmallGameLogo } from '@/components/esport/EsportUI'

/* ── data ── */
const GAME_RANKS = [
  { id: 'valorant', name: 'VALORANT',          rank: 'IMMORTAL 3', mmr: 3250, max: 3500, position: '#4 EU',     color: '#ef2434' },
  { id: 'cod',      name: 'CALL OF DUTY',       rank: 'CRIMSON 1',  mmr: 2850, max: 3000, position: '#127 EU',   color: '#bf6a3a' },
  { id: 'lol',      name: 'LEAGUE OF LEGENDS',  rank: 'DIAMOND 2',  mmr: 2650, max: 2800, position: '#412 EUW',  color: '#7ab6ff' },
  { id: 'apex',     name: 'APEX LEGENDS',       rank: 'MASTER',     mmr: 2400, max: 2600, position: '#88 EU',    color: '#bf3a6a' },
  { id: 'fortnite', name: 'FORTNITE',           rank: 'CHAMPION',   mmr: 2100, max: 2300, position: '#1 204 EU', color: '#a06aff' },
]

const MATCHES = [
  { game: 'valorant', mode: 'COMPÉTITIF',  result: 'V', score: '13 - 9',  kda: '24/14/6', mmr: '+21', map: 'Ascent',       time: 'il y a 32 min' },
  { game: 'valorant', mode: 'COMPÉTITIF',  result: 'V', score: '13 - 11', kda: '19/16/8', mmr: '+18', map: 'Haven',        time: 'il y a 2 h' },
  { game: 'cod',      mode: 'RANKED PLAY', result: 'D', score: '47 - 50', kda: '21/19/4', mmr: '-14', map: 'Skidrow',      time: 'il y a 4 h' },
  { game: 'lol',      mode: 'CLASSÉ SOLO', result: 'V', score: '38 - 22', kda: '11/3/9',  mmr: '+19', map: 'Faille',       time: 'hier' },
  { game: 'valorant', mode: 'COMPÉTITIF',  result: 'D', score: '7 - 13',  kda: '14/17/3', mmr: '-19', map: 'Bind',         time: 'hier' },
  { game: 'apex',     mode: 'CLASSÉ',      result: 'V', score: '#1',      kda: '8 kills',  mmr: '+34', map: 'Storm Point',  time: 'il y a 2 j' },
  { game: 'valorant', mode: 'COMPÉTITIF',  result: 'V', score: '13 - 6',  kda: '28/9/5',  mmr: '+24', map: 'Lotus',        time: 'il y a 2 j' },
  { game: 'fortnite', mode: 'ARÈNE',       result: 'D', score: '#23',     kda: '3 kills',  mmr: '-8',  map: 'Battle Royale', time: 'il y a 3 j' },
]

const ACHIEVEMENTS = [
  { name: 'FIRST BLOOD',    desc: 'Première victoire',          unlocked: true,  icon: '🔪' },
  { name: 'IMMORTEL',       desc: 'Atteindre Immortal',         unlocked: true,  icon: '⚡' },
  { name: 'MARATHONIEN',    desc: '1000 matchs',                unlocked: true,  icon: '🏃' },
  { name: 'TUEUR EN SÉRIE', desc: "10 victoires d'affilée",     unlocked: true,  icon: '🎯' },
  { name: 'RADIANT',        desc: 'Atteindre Radiant',          unlocked: false, icon: '✦' },
  { name: 'LÉGENDE',        desc: 'Top 10 mondial',             unlocked: false, icon: '👑' },
]

const TABS = [
  { id: 'apercu',  label: 'APERÇU' },
  { id: 'matchs',  label: 'MATCHS' },
  { id: 'stats',   label: 'STATISTIQUES' },
  { id: 'success', label: 'SUCCÈS' },
  { id: 'amis',    label: 'AMIS' },
]

/* ── MMR chart ── */
function MMRChart({ data }: { data: number[] }) {
  const W = 600, H = 260, pad = { l: 36, r: 16, t: 24, b: 28 }
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b
  const min = 2700, max = 3400
  const points = data.map((v, i) => [pad.l + i * (innerW / (data.length - 1)), pad.t + (1 - (v - min) / (max - min)) * innerH] as [number, number])
  const pathD = 'M ' + points.map(p => p.join(',')).join(' L ')
  const areaD = pathD + ` L ${points[points.length - 1][0]} ${pad.t + innerH} L ${pad.l} ${pad.t + innerH} Z`
  const last = points[points.length - 1]

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <p className="rs-display" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Progression MMR</p>
          <p style={{ fontSize: 11, color: 'var(--muted)' }}>30 derniers jours · Valorant</p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['7J', '30J', 'TOUT'].map((p, i) => (
            <button key={p} style={{ padding: '5px 10px', borderRadius: 4, border: i === 1 ? '1px solid #ef2434' : '1px solid var(--line)', background: i === 1 ? 'rgba(239,36,52,0.1)' : 'transparent', color: i === 1 ? '#ef2434' : '#8a8a93', fontSize: 10, fontWeight: 600, fontFamily: 'Rajdhani,sans-serif', letterSpacing: '0.08em', cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 12, marginBottom: 8 }}>
        <p className="rs-display" style={{ fontSize: 32, fontWeight: 700 }}>3,250</p>
        <p style={{ color: '#28d17c', fontSize: 12, fontWeight: 600 }}>↑ +245 MMR (30j)</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 200 }}>
        <defs>
          <linearGradient id="mmrG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ef2434" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ef2434" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map(i => {
          const y = pad.t + (i / 3) * innerH
          return (
            <g key={i}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#26262c" strokeDasharray="2 4" />
              <text x={pad.l - 8} y={y + 3} textAnchor="end" fill="#5a5a62" fontSize="10" fontFamily="Rajdhani,sans-serif">{Math.round(max - (i / 3) * (max - min))}</text>
            </g>
          )
        })}
        {[0, 7, 14, 21, 29].map(i => (
          <text key={i} x={pad.l + i * (innerW / 29)} y={H - 8} textAnchor="middle" fill="#5a5a62" fontSize="10" fontFamily="Rajdhani,sans-serif">J-{29 - i}</text>
        ))}
        <path d={areaD} fill="url(#mmrG)" />
        <path d={pathD} fill="none" stroke="#ef2434" strokeWidth="2" />
        <circle cx={last[0]} cy={last[1]} r="5" fill="#ef2434" />
        <circle cx={last[0]} cy={last[1]} r="10" fill="#ef2434" opacity="0.25" />
      </svg>
    </div>
  )
}

export default function ProfilePage() {
  const profile = useAuthStore(s => s.user)
  const [tab, setTab] = useState('apercu')
  const [matchFilter, setMatchFilter] = useState('TOUS')

  const mmrData = useMemo(() => {
    const pts: number[] = []
    let v = 2900
    for (let i = 0; i < 30; i++) {
      v += (Math.random() - 0.45) * 35
      v = Math.max(2700, Math.min(3400, v))
      pts.push(v)
    }
    pts[pts.length - 1] = 3250
    return pts
  }, [])

  const filteredMatches = MATCHES.filter(m =>
    matchFilter === 'TOUS' ? true : matchFilter === 'VICTOIRES' ? m.result === 'V' : m.result === 'D'
  )

  const displayName = profile?.display_name || profile?.username || 'Zerox'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#e0e0e8', fontFamily: "'Inter', sans-serif" }}>

      {/* ── BANNER ── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #14080a, #0e0608)', border: 'none', borderBottom: '1px solid var(--line)', minHeight: 240 }}>
        <svg viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <defs>
            <radialGradient id="pbg" cx="0.7" cy="0.5" r="0.7">
              <stop offset="0" stopColor="#3a0a14" stopOpacity="0.9" />
              <stop offset="1" stopColor="#0a0608" stopOpacity="0" />
            </radialGradient>
            <pattern id="ppgrid" width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M22 0 L0 0 0 22" fill="none" stroke="#2a0a10" strokeWidth="0.5" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="800" height="240" fill="url(#ppgrid)" />
          <rect width="800" height="240" fill="url(#pbg)" />
          <g opacity="0.18" transform="translate(550 30)">
            <path d="M0 0 L100 0 Q140 0 140 38 Q140 68 110 80 L150 175 L100 175 L72 100 L45 100 L45 175 L0 175 Z M45 30 L45 68 L92 68 Q105 68 105 50 Q105 30 92 30 Z" fill="#ef2434" />
          </g>
        </svg>

        <div style={{ position: 'relative', padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 26 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 130, height: 130, borderRadius: '50%', background: 'linear-gradient(135deg, #ef2434, #7a0814)', padding: 3, boxShadow: '0 0 40px rgba(239,36,52,0.5)' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#0a0608' }}>
                <SeedAvatar seed={0} size={124} />
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 4, right: 4, background: '#ef2434', color: '#fff', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '2px solid #0a0608', letterSpacing: '0.05em' }}>LVL 87</div>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <p className="rs-display" style={{ fontSize: 42, fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1 }}>{displayName}</p>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="10" fill="#ef2434" /><path d="M6 11 L9.5 14.5 L16 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(239,36,52,0.15)', color: '#ef2434', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: '0.1em' }}>PRO</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, color: 'var(--muted)', fontSize: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#28d17c' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#28d17c', display: 'inline-block' }} />En ligne
              </span>
              <span>• {profile?.username ? `${profile.username}#2934` : 'zerox#2934'}</span>
              <span>• Membre depuis Mars 2023</span>
              <span>• Paris, FR 🇫🇷</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ImmortalBadge size={44} />
                <div>
                  <p className="rs-display" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.04em' }}>IMMORTAL 3</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>3,250 MMR · Top 0.4%</p>
                </div>
              </div>
              <div style={{ width: 1, height: 36, background: 'var(--line)' }} />
              <div style={{ width: 220 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>
                  <span className="rs-mono">XP NIV.87</span><span>14,820 / 18,000</span>
                </div>
                <div style={{ height: 6, background: '#26262c', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '82%', height: '100%', background: 'linear-gradient(90deg, #c1121f, #ef2434)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <button style={{ padding: '10px 18px', borderRadius: 6, border: 'none', background: 'linear-gradient(180deg, #ef2434, #c1121f)', color: '#fff', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", boxShadow: '0 4px 16px rgba(239,36,52,0.3)', cursor: 'pointer' }}>ÉDITER LE PROFIL</button>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #3a3a42', background: 'transparent', color: '#c0c0c8', fontSize: 10, fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>PARTAGER</button>
              <button style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #3a3a42', background: 'transparent', color: '#c0c0c8', fontSize: 10, fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>OPTIONS</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ position: 'relative', display: 'flex', gap: 4, padding: '0 32px', borderTop: '1px solid var(--line)', background: 'rgba(0,0,0,0.3)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '14px 18px', position: 'relative', color: tab === t.id ? '#ef2434' : '#c0c0c8', fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", background: 'transparent', border: 'none', cursor: 'pointer' }}>
              {t.label}
              {tab === t.id && <span style={{ position: 'absolute', left: 12, right: 12, bottom: 0, height: 2, background: '#ef2434' }} />}
            </button>
          ))}
        </div>
      </section>

      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* ── STAT CARDS ── */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { label: 'MATCHS',    value: '1,248', sub: '+12 cette semaine',  accent: false },
            { label: 'VICTOIRES', value: '712',   sub: '+8 cette semaine',   accent: false },
            { label: 'WINRATE',   value: '57.0%', sub: '↑ 2.1%',            accent: true  },
            { label: 'KDA MOYEN', value: '1.84',  sub: '↑ 0.12',            accent: false },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: 18, position: 'relative', overflow: 'hidden' }}>
              {s.accent && <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: 'radial-gradient(circle at top right, rgba(239,36,52,0.25), transparent 70%)' }} />}
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <p className="rs-mono" style={{ color: 'var(--muted)', marginBottom: 4 }}>{s.label}</p>
              </div>
              <p className="rs-display" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, marginBottom: 6 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: '#28d17c' }}>{s.sub}</p>
            </div>
          ))}
        </section>

        {/* ── MMR CHART + ACHIEVEMENTS ── */}
        <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
          <MMRChart data={mmrData} />
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <div>
                <p className="rs-display" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Succès</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{ACHIEVEMENTS.filter(a => a.unlocked).length} / {ACHIEVEMENTS.length} débloqués</p>
              </div>
              <button className="rs-mono" style={{ color: '#ef2434', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>VOIR TOUT</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {ACHIEVEMENTS.map((a, i) => (
                <div key={i} style={{ borderRadius: 8, padding: 12, background: a.unlocked ? 'rgba(239,36,52,0.06)' : 'rgba(255,255,255,0.02)', border: a.unlocked ? '1px solid rgba(239,36,52,0.3)' : '1px solid var(--line)', opacity: a.unlocked ? 1 : 0.5, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 6, filter: a.unlocked ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
                  <p className="rs-display" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: a.unlocked ? '#fff' : '#6a6a72', marginBottom: 2 }}>{a.name}</p>
                  <p style={{ fontSize: 9, color: 'var(--muted)' }}>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GAME RANKS ── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <p className="rs-display" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Rangs par jeu</p>
            <button className="rs-mono" style={{ color: '#ef2434', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>TOUS LES JEUX</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
            {GAME_RANKS.map(g => (
              <div key={g.id} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: 16, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}><SmallGameLogo game={g.id} /></div>
                  <p className="rs-display" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.03em' }}>{g.name}</p>
                </div>
                <p className="rs-display" style={{ fontSize: 16, fontWeight: 700, color: g.color, letterSpacing: '0.04em', marginBottom: 4 }}>{g.rank}</p>
                <p className="rs-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{g.mmr.toLocaleString()} <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>MMR</span></p>
                <div style={{ height: 4, background: '#26262c', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ width: `${(g.mmr / g.max) * 100}%`, height: '100%', background: g.color }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)' }}>
                  <span>{g.position}</span>
                  <span>{g.mmr} / {g.max}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MATCH HISTORY ── */}
        <section style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <p className="rs-display" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Historique des matchs</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['TOUS', 'VICTOIRES', 'DÉFAITES'].map(f => (
                <button key={f} onClick={() => setMatchFilter(f)} style={{ padding: '6px 12px', borderRadius: 4, border: matchFilter === f ? '1px solid #ef2434' : '1px solid var(--line)', background: matchFilter === f ? 'rgba(239,36,52,0.1)' : 'transparent', color: matchFilter === f ? '#ef2434' : '#8a8a93', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', fontFamily: "'Rajdhani', sans-serif", cursor: 'pointer' }}>{f}</button>
              ))}
            </div>
          </div>

          <div className="rs-mono" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 0.8fr 1fr 1fr 0.8fr 1fr', color: 'var(--muted-2)', padding: '0 12px 10px', borderBottom: '1px solid var(--line)' }}>
            <span>JEU</span><span>MODE / MAP</span><span>RÉSULTAT</span><span>SCORE</span><span>K/D/A</span><span>MMR</span><span style={{ textAlign: 'right' }}>QUAND</span>
          </div>

          {filteredMatches.map((m, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 0.8fr 1fr 1fr 0.8fr 1fr', padding: '14px 12px', borderBottom: i === filteredMatches.length - 1 ? 'none' : '1px solid #1f1f24', alignItems: 'center', fontSize: 13, background: m.result === 'V' ? 'linear-gradient(90deg, rgba(40,209,124,0.04), transparent 30%)' : 'linear-gradient(90deg, rgba(239,36,52,0.04), transparent 30%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}><SmallGameLogo game={m.game} /></div>
                <p className="rs-display" style={{ fontWeight: 600, letterSpacing: '0.03em' }}>
                  {m.game === 'cod' ? 'CALL OF DUTY' : m.game === 'lol' ? 'LEAGUE OF LEGENDS' : m.game === 'apex' ? 'APEX LEGENDS' : m.game.toUpperCase()}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#c0c0c8' }}>{m.mode}</p>
                <p style={{ fontSize: 10, color: 'var(--muted)' }}>{m.map}</p>
              </div>
              <div>
                <span style={{ padding: '3px 10px', borderRadius: 3, background: m.result === 'V' ? 'rgba(40,209,124,0.15)' : 'rgba(239,36,52,0.15)', color: m.result === 'V' ? '#28d17c' : '#ef2434', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif" }}>{m.result === 'V' ? 'VICTOIRE' : 'DÉFAITE'}</span>
              </div>
              <p className="rs-display" style={{ fontWeight: 600 }}>{m.score}</p>
              <p style={{ fontSize: 12, color: '#c0c0c8' }}>{m.kda}</p>
              <p className="rs-display" style={{ fontWeight: 700, color: m.mmr.startsWith('+') ? '#28d17c' : '#ef2434' }}>{m.mmr}</p>
              <p style={{ textAlign: 'right', fontSize: 11, color: 'var(--muted)' }}>{m.time}</p>
            </div>
          ))}

          <button style={{ width: '100%', marginTop: 12, padding: '10px', border: '1px solid var(--line)', borderRadius: 6, background: 'transparent', color: '#c0c0c8', fontSize: 11, fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: '0.1em', cursor: 'pointer' }}>VOIR TOUS LES MATCHS →</button>
        </section>
      </div>
    </div>
  )
}
