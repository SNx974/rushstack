import { motion } from 'framer-motion'
import { Trophy, Swords, Users, TrendingUp, Gamepad2, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'

const MOCK_RECENT_MATCHES = [
  { id: '1', game: 'CS2', result: 'win', mmrChange: +23, opponent: 'ShadowKiller99', date: '2h ago' },
  { id: '2', game: 'Valorant', result: 'loss', mmrChange: -18, opponent: 'ProSniper_X', date: '5h ago' },
  { id: '3', game: 'CS2', result: 'win', mmrChange: +19, opponent: 'NightHawk_EU', date: '1d ago' },
]

const MOCK_GAMES = [
  { id: '1', name: 'CS2', players: '12,430', color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/20' },
  { id: '2', name: 'Valorant', players: '9,812', color: 'from-red-500/20 to-pink-500/20', border: 'border-red-500/20' },
  { id: '3', name: 'Rocket League', players: '4,201', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20' },
  { id: '4', name: 'Street Fighter 6', players: '2,108', color: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/20' },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export default function HomePage() {
  const profile = useAuthStore(s => s.user)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Hero greeting */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500/10 via-surface-200 to-surface-200 border border-brand-500/20 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-sm text-white/40 mb-1">Welcome back,</p>
          <h1 className="text-2xl lg:text-3xl font-black text-white">
            {profile?.display_name || profile?.username || 'Player'}
            <span className="text-brand-500"> ⚡</span>
          </h1>
          <p className="text-white/50 mt-1 text-sm">Ready to climb the ranks today?</p>
          <div className="flex items-center gap-3 mt-4">
            <Link to="/play">
              <Button size="md" className="gap-2">
                <Swords className="w-4 h-4" /> Find Match
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="outline" size="md">View Rankings</Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Current MMR" value="2,847" trend="up" trendValue="+124 this week" accent icon={<Trophy className="w-5 h-5" />} />
        <StatCard label="Rank" value="Gold II" sub="Top 23%" icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard label="Win Rate" value="58.3%" sub="Last 20 matches" icon={<Swords className="w-5 h-5" />} />
        <StatCard label="Friends Online" value="7" sub="of 24 friends" icon={<Users className="w-5 h-5" />} />
      </motion.div>

      {/* Games + Recent matches */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Games */}
        <motion.div variants={item} className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Games</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MOCK_GAMES.map(game => (
              <Link key={game.id} to="/play">
                <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${game.color} border ${game.border} p-3 hover:scale-[1.02] transition-transform cursor-pointer`}>
                  <Gamepad2 className="w-6 h-6 text-white/40 mb-2" />
                  <p className="text-sm font-bold text-white">{game.name}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{game.players} online</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Matches */}
        <motion.div variants={item} className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Recent Matches</h2>
            <Link to="/profile" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {MOCK_RECENT_MATCHES.map(match => (
              <div key={match.id} className="flex items-center gap-3 card py-3">
                <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${match.result === 'win' ? 'bg-green-500' : 'bg-red-500'}`} />
                <Avatar name={match.opponent} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{match.opponent}</p>
                  <p className="text-xs text-white/40">{match.game} · {match.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge variant={match.result === 'win' ? 'success' : 'danger'}>
                    {match.result}
                  </Badge>
                  <p className={`text-xs font-mono font-bold mt-1 ${match.mmrChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {match.mmrChange > 0 ? '+' : ''}{match.mmrChange} MMR
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
