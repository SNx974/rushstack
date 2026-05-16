import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, Swords, AlertTriangle, Ban, BarChart3, Image, Gamepad2 } from 'lucide-react'
import MediaManager from './MediaManager'
import GamesAdmin from './GamesAdmin'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { getConflicts, resolveConflict, type MatchSession } from '@/services/match.service'

const MOCK_USERS = [
  { id: '1', username: 'ShadowKiller99', role: 'player', banned: false, matches: 847, joined: '2024-01-15' },
  { id: '2', username: 'ProSniper_X', role: 'player', banned: true, matches: 312, joined: '2024-02-20' },
  { id: '3', username: 'NightHawk_EU', role: 'moderator', banned: false, matches: 1203, joined: '2023-11-10' },
]

const MOCK_DISPUTES = [
  { id: '1', match: '#10293', reporter: 'FlameAce', reported: 'ZeroGravity', reason: 'Cheating', status: 'open' },
  { id: '2', match: '#10287', reporter: 'DarkMatter', reported: 'QuantumRush', reason: 'Toxic behavior', status: 'under_review' },
]

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'disputes', label: 'Disputes', icon: AlertTriangle },
  { id: 'games', label: 'Jeux', icon: Gamepad2 },
  { id: 'conflicts', label: 'Conflits', icon: Swords },
  { id: 'media', label: 'Médias', icon: Image },
]

export default function AdminPage() {
  const [section, setSection] = useState('overview')
  const [conflicts, setConflicts] = useState<MatchSession[]>([])

  useEffect(() => {
    if (section === 'conflicts') {
      getConflicts().then(setConflicts)
    }
  }, [section])

  const handleResolve = async (matchId: string, winner: 'A' | 'B') => {
    try {
      await resolveConflict(matchId, winner)
      setConflicts(c => c.filter(x => x.id !== matchId))
    } catch { /* ignore */ }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-brand-500" />
        <h1 className="text-2xl font-black text-white">Admin Panel</h1>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 p-1 bg-surface-200 rounded-lg w-fit">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              section === s.id ? 'bg-surface-100 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      {section === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Users" value="14,832" trend="up" trendValue="+312 this week" icon={<Users className="w-4 h-4" />} />
            <StatCard label="Matches Today" value="2,140" icon={<Swords className="w-4 h-4" />} />
            <StatCard label="Open Disputes" value="7" trend="down" trendValue="-3 vs yesterday" icon={<AlertTriangle className="w-4 h-4" />} />
            <StatCard label="Active Bans" value="23" icon={<Ban className="w-4 h-4" />} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Recent Disputes</h3>
              <div className="space-y-2">
                {MOCK_DISPUTES.map(d => (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-white font-medium">Match {d.match}</span>
                      <span className="text-white/40 ml-2">· {d.reason}</span>
                    </div>
                    <Badge variant={d.status === 'open' ? 'warning' : 'brand'}>
                      {d.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Platform Health</h3>
              <div className="space-y-3">
                {[
                  { label: 'API Latency', value: '42ms', ok: true },
                  { label: 'Queue Health', value: 'Operational', ok: true },
                  { label: 'Realtime', value: 'Operational', ok: true },
                  { label: 'Storage', value: '68% used', ok: true },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-white/60">{item.label}</span>
                    <span className={item.ok ? 'text-green-400' : 'text-red-400'}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {section === 'users' && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-4 py-3">Player</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-right text-xs font-semibold text-white/40 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-white/40 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map(user => (
                  <tr key={user.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.username} size="sm" />
                        <span className="text-sm font-semibold text-white">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'moderator' ? 'brand' : 'default'}>{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={user.banned ? 'danger' : 'success'}>{user.banned ? 'Banned' : 'Active'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">{user.banned ? 'Unban' : 'Ban'}</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === 'media' && <MediaManager />}
      {section === 'games' && <GamesAdmin />}

      {section === 'conflicts' && (
        <div className="space-y-3">
          {conflicts.length === 0 && (
            <div className="card text-center text-white/40 py-8">Aucun conflit en attente ✓</div>
          )}
          {conflicts.map(m => (
            <div key={m.id} className="card flex items-start gap-4">
              <Swords className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">Match #{m.id.slice(0, 8)}</span>
                  <Badge variant="warning">conflit</Badge>
                </div>
                <p className="text-xs text-white/40 mt-0.5">
                  Rapports contradictoires — désignez le vainqueur
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" onClick={() => handleResolve(m.id, 'A')}>Équipe A gagne</Button>
                <Button size="sm" variant="ghost" onClick={() => handleResolve(m.id, 'B')}>Équipe B gagne</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {section === 'disputes' && (
        <div className="space-y-2">
          {MOCK_DISPUTES.map(d => (
            <div key={d.id} className="card flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">Match {d.match}</span>
                  <Badge variant={d.status === 'open' ? 'warning' : 'brand'}>{d.status.replace('_', ' ')}</Badge>
                </div>
                <p className="text-xs text-white/40 mt-0.5">
                  <span className="text-white/60">{d.reporter}</span> reported <span className="text-white/60">{d.reported}</span> for {d.reason}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm">Review</Button>
                <Button variant="ghost" size="sm">Dismiss</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
