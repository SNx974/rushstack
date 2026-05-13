import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Clock, Users, Zap, X, Gamepad2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'

const GAMES = [
  { id: 'cs2', name: 'CS2', modes: ['5v5 Competitive', '1v1 Duel'], online: 12430, color: 'border-amber-500/30 bg-amber-500/5' },
  { id: 'valorant', name: 'Valorant', modes: ['5v5 Ranked', '1v1 Duel'], online: 9812, color: 'border-red-500/30 bg-red-500/5' },
  { id: 'rl', name: 'Rocket League', modes: ['1v1', '2v2', '3v3'], online: 4201, color: 'border-blue-500/30 bg-blue-500/5' },
  { id: 'sf6', name: 'Street Fighter 6', modes: ['1v1 Ranked'], online: 2108, color: 'border-purple-500/30 bg-purple-500/5' },
]

type QueueState = 'idle' | 'searching' | 'found'

export default function PlayPage() {
  const [selectedGame, setSelectedGame] = useState(GAMES[0])
  const [selectedMode, setSelectedMode] = useState(GAMES[0].modes[0])
  const [queueState, setQueueState] = useState<QueueState>('idle')
  const [searchTime, setSearchTime] = useState(0)

  const startQueue = () => {
    setQueueState('searching')
    setSearchTime(0)
    const interval = setInterval(() => setSearchTime(t => t + 1), 1000)
    // Simulate finding a match after ~5s
    setTimeout(() => {
      clearInterval(interval)
      setQueueState('found')
    }, 5000)
  }

  const cancelQueue = () => {
    setQueueState('idle')
    setSearchTime(0)
  }

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Swords className="w-6 h-6 text-brand-500" /> Play Now
        </h1>
        <p className="text-white/40 text-sm mt-1">Find competitive matches instantly</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Game + Mode selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Game selection */}
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Select Game</p>
            <div className="grid grid-cols-2 gap-2">
              {GAMES.map(game => (
                <button
                  key={game.id}
                  onClick={() => { setSelectedGame(game); setSelectedMode(game.modes[0]) }}
                  className={`relative p-4 rounded-xl border text-left transition-all ${
                    selectedGame.id === game.id
                      ? `${game.color} scale-[1.02]`
                      : 'border-white/10 bg-surface-200 hover:border-white/20'
                  }`}
                >
                  {selectedGame.id === game.id && (
                    <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-brand-400" />
                  )}
                  <Gamepad2 className="w-5 h-5 text-white/40 mb-2" />
                  <p className="font-bold text-white text-sm">{game.name}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{game.online.toLocaleString()} online</p>
                </button>
              ))}
            </div>
          </div>

          {/* Mode selection */}
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Game Mode</p>
            <div className="flex gap-2 flex-wrap">
              {selectedGame.modes.map(mode => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    selectedMode === mode
                      ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                      : 'border-white/10 text-white/50 hover:text-white hover:border-white/20'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Queue state */}
          <AnimatePresence mode="wait">
            {queueState === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button size="lg" className="w-full" onClick={startQueue}>
                  <Zap className="w-5 h-5" fill="currentColor" /> Find Match
                </Button>
              </motion.div>
            )}

            {queueState === 'searching' && (
              <motion.div key="searching" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="card border-brand-500/30 bg-brand-500/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <div>
                      <p className="font-semibold text-white text-sm">Searching for match...</p>
                      <p className="text-xs text-white/40">{selectedGame.name} · {selectedMode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-mono font-black text-brand-400">{formatTime(searchTime)}</p>
                    <button onClick={cancelQueue} className="text-xs text-white/40 hover:text-red-400 flex items-center gap-1 mt-1 transition-colors ml-auto">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {queueState === 'found' && (
              <motion.div key="found" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="card border-green-500/30 bg-green-500/5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="font-bold text-white">Match Found!</p>
                    <p className="text-xs text-white/40">Accept within 15 seconds</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={() => setQueueState('idle')}>
                    Accept
                  </Button>
                  <Button variant="danger" className="flex-1" onClick={cancelQueue}>
                    Decline
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Stats */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Your Stats</p>
          <StatCard label="MMR" value="2,847" accent icon={<Swords className="w-4 h-4" />} />
          <StatCard label="Estimated Wait" value="~2 min" icon={<Clock className="w-4 h-4" />} />
          <StatCard label="In Queue" value="234" sub="players right now" icon={<Users className="w-4 h-4" />} />

          <div className="card">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Queue Activity</p>
            <div className="space-y-2">
              {['Just now', '1m ago', '2m ago', '3m ago'].map((time, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Match #{1024 + i} started</span>
                  <span className="text-white/25">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
