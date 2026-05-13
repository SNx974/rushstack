import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Search, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import type { RankTier } from '@/types/database.types'

const GAMES = ['All Games', 'CS2', 'Valorant', 'Rocket League', 'Street Fighter 6']

const MOCK_PLAYERS = Array.from({ length: 20 }, (_, i) => ({
  rank: i + 1,
  username: ['ShadowKiller99', 'ProSniper_X', 'NightHawk_EU', 'FlameAce', 'ZeroGravity', 'DarkMatter', 'QuantumRush', 'IcePhoenix', 'ThunderBolt', 'CyberWolf', 'NeonBlade', 'StormBreaker', 'VoidWalker', 'SilverBullet', 'GoldRush', 'DiamondDust', 'PlatinaEdge', 'MasterFear', 'GrandSlam', 'ChallengerX'][i],
  mmr: 4200 - i * 120 + Math.floor(Math.random() * 80),
  tier: ['challenger', 'grandmaster', 'master', 'diamond', 'diamond', 'platinum', 'platinum', 'gold', 'gold', 'gold', 'silver', 'silver', 'silver', 'silver', 'bronze', 'bronze', 'bronze', 'bronze', 'bronze', 'bronze'][i] as RankTier,
  wins: 280 - i * 10,
  losses: 140 + i * 5,
  winRate: Math.round((280 - i * 10) / (280 - i * 10 + 140 + i * 5) * 100),
}))

const tierOrder = ['challenger', 'grandmaster', 'master', 'diamond', 'platinum', 'gold', 'silver', 'bronze']

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-4 h-4 text-[#ffd700]" fill="currentColor" />
  if (rank === 2) return <Crown className="w-4 h-4 text-[#c0c0c0]" fill="currentColor" />
  if (rank === 3) return <Crown className="w-4 h-4 text-[#cd7f32]" fill="currentColor" />
  return <span className="text-sm font-mono font-bold text-white/40">#{rank}</span>
}

export default function LeaderboardPage() {
  const [selectedGame, setSelectedGame] = useState('All Games')
  const [search, setSearch] = useState('')

  const filtered = MOCK_PLAYERS.filter(p =>
    p.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-brand-500" /> Leaderboard
        </h1>
        <p className="text-white/40 text-sm mt-1">Top players ranked by MMR</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search player..."
          icon={<Search className="w-4 h-4" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {GAMES.map(game => (
            <button
              key={game}
              onClick={() => setSelectedGame(game)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedGame === game
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-200 text-white/50 hover:text-white border border-white/10'
              }`}
            >
              {game}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3">
        {[MOCK_PLAYERS[1], MOCK_PLAYERS[0], MOCK_PLAYERS[2]].map((player, i) => (
          <motion.div
            key={player.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`card text-center relative overflow-hidden ${player.rank === 1 ? 'border-[#ffd700]/30 bg-[#ffd700]/5' : player.rank === 2 ? 'border-[#c0c0c0]/20' : 'border-[#cd7f32]/20'}`}
          >
            {player.rank === 1 && <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#ffd700]/60 to-transparent" />}
            <div className="flex justify-center mb-2">
              <Avatar name={player.username} size={player.rank === 1 ? 'lg' : 'md'} />
            </div>
            <RankIcon rank={player.rank} />
            <p className="text-sm font-bold text-white mt-1 truncate">{player.username}</p>
            <p className="text-xs font-mono text-white/50">{player.mmr.toLocaleString()} MMR</p>
            <div className="mt-2">
              <Badge variant={player.tier as any}>{player.tier}</Badge>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-4 py-3 w-12">#</th>
                <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-4 py-3">Player</th>
                <th className="text-right text-xs font-semibold text-white/40 uppercase tracking-wider px-4 py-3">Rank</th>
                <th className="text-right text-xs font-semibold text-white/40 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">MMR</th>
                <th className="text-right text-xs font-semibold text-white/40 uppercase tracking-wider px-4 py-3 hidden md:table-cell">W/L</th>
                <th className="text-right text-xs font-semibold text-white/40 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((player, idx) => (
                <motion.tr
                  key={player.rank}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center w-6"><RankIcon rank={player.rank} /></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={player.username} size="sm" />
                      <span className="text-sm font-semibold text-white">{player.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={player.tier as any}>{player.tier}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className="text-sm font-mono font-bold text-white">{player.mmr.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className="text-xs text-green-400">{player.wins}W</span>
                    <span className="text-xs text-white/30 mx-1">/</span>
                    <span className="text-xs text-red-400">{player.losses}L</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className="text-sm font-semibold text-white">{player.winRate}%</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
