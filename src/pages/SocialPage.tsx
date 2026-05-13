import { useState } from 'react'
import { SeedAvatar, S } from '@/components/esport/EsportUI'

const FRIENDS = [
  { name: 'NeyZ', status: 'online', activity: 'En match · VALORANT', seed: 1, mmr: '4,350 MMR', rank: 'RADIANT' },
  { name: 'Skyline', status: 'online', activity: 'Dans le lobby', seed: 2, mmr: '4,120 MMR', rank: 'RADIANT' },
  { name: 'W4rrior', status: 'online', activity: 'En recherche · CS2', seed: 4, mmr: '3,980 MMR', rank: 'IMMORTAL 3' },
  { name: 'Kirua', status: 'away', activity: 'Inactif depuis 15 min', seed: 5, mmr: '3,150 MMR', rank: 'IMMORTAL 1' },
  { name: 'FlameAce', status: 'offline', activity: 'Hors ligne · il y a 2h', seed: 3, mmr: '2,900 MMR', rank: 'DIAMOND 2' },
  { name: 'ShadowKill', status: 'offline', activity: 'Hors ligne · hier', seed: 0, mmr: '2,650 MMR', rank: 'DIAMOND 1' },
]

const REQUESTS = [
  { name: 'ProSniper_X', seed: 2, mmr: '3,500 MMR', rank: 'IMMORTAL 2' },
  { name: 'NightHawk_EU', seed: 4, mmr: '2,800 MMR', rank: 'DIAMOND 3' },
]

const RECENT = [
  { name: 'NeyZ', action: 'a atteint le rang RADIANT', time: '10 min', seed: 1, positive: true },
  { name: 'Skyline', action: 'a remporté 5 matchs de suite', time: '1 h', seed: 2, positive: true },
  { name: 'W4rrior', action: 'a perdu son rang IMMORTAL 3', time: '2 h', seed: 4, positive: false },
  { name: 'Kirua', action: 'a rejoint Rush Stack', time: '5 h', seed: 5, positive: true },
]

const STATUS_DOT: Record<string, string> = {
  online: '#28d17c',
  away: '#e8c84a',
  offline: '#3a3a44',
}

export default function SocialPage() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'amis' | 'demandes'>('amis')

  const online = FRIENDS.filter(f => f.status === 'online')
  const offline = FRIENDS.filter(f => f.status !== 'online')
  const filtered = FRIENDS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#e0e0e8', fontFamily: "'Inter', sans-serif", padding: '32px 40px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 3, height: 24, background: '#ef2434', borderRadius: 2 }} />
        <p className="rs-mono" style={{ color: '#ef2434', fontWeight: 700 }}>AMIS</p>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {(['amis', 'demandes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.1em',
              background: tab === t ? '#ef2434' : 'var(--panel)',
              color: tab === t ? '#fff' : 'var(--muted)',
              position: 'relative',
            }}>
              {t.toUpperCase()}
              {t === 'demandes' && REQUESTS.length > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#ef2434', border: '2px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>{REQUESTS.length}</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {tab === 'amis' ? (
            <>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un ami..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 16px 10px 40px', borderRadius: 8, border: '1px solid var(--line)',
                    background: 'var(--panel)', color: '#e0e0e8',
                    fontFamily: "'Inter', sans-serif", fontSize: 13, outline: 'none',
                  }}
                />
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                  <circle cx="7" cy="7" r="5" stroke="#e0e0e8" strokeWidth="1.5" />
                  <path d="M11 11 L14 14" stroke="#e0e0e8" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Online */}
              <div style={{ ...S.panel, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#28d17c', display: 'inline-block' }} />
                  <p className="rs-mono" style={{ color: 'var(--muted-2)' }}>EN LIGNE — {online.length}</p>
                </div>
                {(search ? filtered.filter(f => f.status === 'online') : online).map(f => (
                  <FriendRow key={f.name} friend={f} />
                ))}
              </div>

              {/* Offline */}
              <div style={{ ...S.panel, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3a3a44', display: 'inline-block' }} />
                  <p className="rs-mono" style={{ color: 'var(--muted-2)' }}>HORS LIGNE — {offline.length}</p>
                </div>
                {(search ? filtered.filter(f => f.status !== 'online') : offline).map(f => (
                  <FriendRow key={f.name} friend={f} />
                ))}
              </div>
            </>
          ) : (
            /* Requests */
            <div style={{ ...S.panel, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
                <p className="rs-mono" style={{ color: 'var(--muted-2)' }}>DEMANDES EN ATTENTE — {REQUESTS.length}</p>
              </div>
              {REQUESTS.map(r => (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
                  <SeedAvatar seed={r.seed} size={42} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{r.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{r.rank} · {r.mmr}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#ef2434', color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.08em' }}>ACCEPTER</button>
                    <button style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--line)', cursor: 'pointer', background: 'transparent', color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.08em' }}>REFUSER</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Add friend */}
          <div style={{ ...S.panel, padding: 20 }}>
            <p className="rs-mono" style={{ color: 'var(--muted-2)', marginBottom: 14 }}>AJOUTER UN AMI</p>
            <input
              placeholder="Pseudo du joueur..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 14px', borderRadius: 8, border: '1px solid var(--line)',
                background: 'var(--panel-2)', color: '#e0e0e8',
                fontFamily: "'Inter', sans-serif", fontSize: 13, outline: 'none', marginBottom: 10,
              }}
            />
            <button style={{ width: '100%', padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#ef2434', color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.1em' }}>
              ENVOYER LA DEMANDE
            </button>
          </div>

          {/* Activity */}
          <div style={{ ...S.panel, padding: 20 }}>
            <p className="rs-mono" style={{ color: 'var(--muted-2)', marginBottom: 16 }}>ACTIVITÉ RÉCENTE</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {RECENT.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < RECENT.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <SeedAvatar seed={r.seed} size={30} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, color: '#e0e0e8' }}>
                      <span style={{ fontWeight: 600 }}>{r.name}</span>{' '}
                      <span style={{ color: r.positive ? '#28d17c' : '#ef2434' }}>{r.action}</span>
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--muted-2)', marginTop: 3 }}>il y a {r.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ ...S.panel, padding: 20 }}>
            <p className="rs-mono" style={{ color: 'var(--muted-2)', marginBottom: 14 }}>MES AMIS</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['TOTAL', String(FRIENDS.length)], ['EN LIGNE', String(online.length)], ['EN MATCH', '2'], ['DEMANDES', String(REQUESTS.length)]].map(([l, v]) => (
                <div key={l} style={{ padding: '12px', background: 'var(--panel-2)', borderRadius: 8, border: '1px solid var(--line)' }}>
                  <p className="rs-mono" style={{ color: 'var(--muted-2)', marginBottom: 4 }}>{l}</p>
                  <p className="rs-display" style={{ fontSize: 22, fontWeight: 700, color: l === 'EN LIGNE' ? '#28d17c' : '#fff' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FriendRow({ friend }: { friend: typeof FRIENDS[0] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid var(--line)', opacity: friend.status === 'offline' ? 0.6 : 1 }}>
      <div style={{ position: 'relative' }}>
        <SeedAvatar seed={friend.seed} size={38} />
        <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: STATUS_DOT[friend.status], border: '2px solid var(--panel)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{friend.name}</p>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{friend.activity}</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: 11, color: 'var(--muted-2)' }}>{friend.rank}</p>
        <p className="rs-mono" style={{ color: '#ef2434', marginTop: 2 }}>{friend.mmr}</p>
      </div>
      {friend.status === 'online' && (
        <button style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(239,36,52,0.3)', cursor: 'pointer', background: 'rgba(239,36,52,0.08)', color: '#ef2434', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.08em' }}>
          INVITER
        </button>
      )}
    </div>
  )
}
