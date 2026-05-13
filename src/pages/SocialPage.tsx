import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, UserPlus, MessageSquare, Swords } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { RankTier } from '@/types/database.types'

const MOCK_FRIENDS = [
  { id: '1', username: 'ShadowKiller99', tier: 'diamond' as RankTier, mmr: 3241, online: true, status: 'In Match · CS2' },
  { id: '2', username: 'ProSniper_X', tier: 'platinum' as RankTier, mmr: 2890, online: true, status: 'In Queue · Valorant' },
  { id: '3', username: 'NightHawk_EU', tier: 'gold' as RankTier, mmr: 2450, online: false, status: 'Last seen 2h ago' },
  { id: '4', username: 'FlameAce', tier: 'gold' as RankTier, mmr: 2310, online: false, status: 'Last seen 1d ago' },
  { id: '5', username: 'ZeroGravity', tier: 'silver' as RankTier, mmr: 1820, online: true, status: 'Online · Idle' },
]

const MOCK_REQUESTS = [
  { id: '1', username: 'DarkMatter', tier: 'platinum' as RankTier, mutuals: 3 },
  { id: '2', username: 'QuantumRush', tier: 'gold' as RankTier, mutuals: 1 },
]

export default function SocialPage() {
  const [tab, setTab] = useState<'friends' | 'requests'>('friends')
  const [search, setSearch] = useState('')

  const filtered = MOCK_FRIENDS.filter(f => f.username.toLowerCase().includes(search.toLowerCase()))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-500" /> Social
          </h1>
          <p className="text-white/40 text-sm mt-1">{MOCK_FRIENDS.filter(f => f.online).length} friends online</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-200 rounded-lg w-fit">
        {(['friends', 'requests'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t ? 'bg-surface-100 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            {t === 'friends' ? `Friends (${MOCK_FRIENDS.length})` : `Requests (${MOCK_REQUESTS.length})`}
          </button>
        ))}
      </div>

      {tab === 'friends' && (
        <div className="space-y-3">
          <Input
            placeholder="Search friends..."
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* Online first */}
          <div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Online — {filtered.filter(f => f.online).length}</p>
            <div className="space-y-1">
              {filtered.filter(f => f.online).map(friend => (
                <FriendRow key={friend.id} friend={friend} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Offline — {filtered.filter(f => !f.online).length}</p>
            <div className="space-y-1">
              {filtered.filter(f => !f.online).map(friend => (
                <FriendRow key={friend.id} friend={friend} />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-2">
          {MOCK_REQUESTS.map(req => (
            <div key={req.id} className="card flex items-center gap-3">
              <Avatar name={req.username} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{req.username}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={req.tier}>{req.tier}</Badge>
                  <span className="text-xs text-white/30">{req.mutuals} mutual friends</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Accept</Button>
                <Button variant="ghost" size="sm">Decline</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function FriendRow({ friend }: { friend: typeof MOCK_FRIENDS[0] }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group">
      <Avatar name={friend.username} size="sm" online={friend.online} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{friend.username}</span>
          <Badge variant={friend.tier}>{friend.tier}</Badge>
        </div>
        <p className={`text-xs truncate ${friend.online ? 'text-green-400' : 'text-white/30'}`}>{friend.status}</p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Invite to match">
          <Swords className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Message">
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
