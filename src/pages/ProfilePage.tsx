import { motion } from 'framer-motion'
import { Trophy, Swords, TrendingUp, Calendar, Edit3 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'

const MOCK_MATCH_HISTORY = Array.from({ length: 10 }, (_, i) => ({
  id: String(i),
  game: i % 2 === 0 ? 'CS2' : 'Valorant',
  result: Math.random() > 0.4 ? 'win' : 'loss',
  mmrChange: Math.random() > 0.4 ? Math.floor(Math.random() * 30) + 10 : -(Math.floor(Math.random() * 25) + 10),
  opponent: ['ShadowKiller99', 'ProSniper_X', 'NightHawk_EU', 'FlameAce', 'ZeroGravity'][i % 5],
  date: `${i + 1}d ago`,
  duration: `${Math.floor(Math.random() * 20) + 25}m`,
}))

export default function ProfilePage() {
  const profile = useAuthStore(s => s.user)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Profile header */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-200 border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-brand-500/20 to-transparent" />
        <div className="relative p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <Avatar
              src={profile?.avatar_url}
              name={profile?.display_name || profile?.username}
              size="xl"
              online
              className="ring-4 ring-brand-500/30"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white">{profile?.display_name || profile?.username || 'Player'}</h1>
                <Badge variant="gold">Gold II</Badge>
                {profile?.role === 'admin' && <Badge variant="danger">Admin</Badge>}
              </div>
              <p className="text-white/50 text-sm">@{profile?.username}</p>
              {profile?.bio && <p className="text-white/60 text-sm mt-1">{profile.bio}</p>}
              <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined March 2024</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="flex-shrink-0">
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Peak MMR" value="3,102" icon={<TrendingUp className="w-4 h-4" />} />
        <StatCard label="Total Matches" value="847" icon={<Swords className="w-4 h-4" />} />
        <StatCard label="Win Rate" value="58.3%" trend="up" trendValue="+2.1% vs last season" icon={<Trophy className="w-4 h-4" />} />
        <StatCard label="Season Rank" value="Gold II" sub="Top 23%" accent icon={<Trophy className="w-4 h-4" />} />
      </div>

      {/* Rank progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Rank Progress</h2>
          <Badge variant="gold">Gold II</Badge>
        </div>
        <div className="space-y-3">
          {[
            { game: 'CS2', mmr: 2847, tier: 'gold' as const, progress: 72 },
            { game: 'Valorant', mmr: 1930, tier: 'silver' as const, progress: 45 },
          ].map(item => (
            <div key={item.game}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{item.game}</span>
                  <Badge variant={item.tier}>{item.tier}</Badge>
                </div>
                <span className="text-sm font-mono font-bold text-white">{item.mmr.toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-white/30">Gold II</span>
                <span className="text-[10px] text-white/30">{item.progress}% to Gold I</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match history */}
      <div>
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">Match History</h2>
        <div className="space-y-2">
          {MOCK_MATCH_HISTORY.map(match => (
            <div key={match.id} className="flex items-center gap-3 card py-3">
              <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${match.result === 'win' ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{match.game}</span>
                  <span className="text-xs text-white/30">vs {match.opponent}</span>
                </div>
                <p className="text-xs text-white/30">{match.duration} · {match.date}</p>
              </div>
              <Badge variant={match.result === 'win' ? 'success' : 'danger'}>{match.result}</Badge>
              <span className={`text-sm font-mono font-bold w-14 text-right flex-shrink-0 ${match.mmrChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {match.mmrChange > 0 ? '+' : ''}{match.mmrChange}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
