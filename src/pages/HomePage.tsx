import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Trophy, MapPin, Wifi, Info, Plus, ChevronRight, LayoutGrid } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { Avatar } from '@/components/ui/Avatar'

const GAMES = [
  { id: 'valorant', name: 'VALORANT', mmr: 3250, icon: '🎯', color: '#FF4655', bg: 'from-red-500/20 to-red-900/10', border: 'border-red-500/40', activeBg: 'bg-red-500/10' },
  { id: 'lol', name: 'LEAGUE OF LEGENDS', mmr: 2850, icon: '⚔️', color: '#C89B3C', bg: 'from-amber-500/20 to-amber-900/10', border: 'border-amber-500/20', activeBg: '' },
  { id: 'apex', name: 'APEX LEGENDS', mmr: 2950, icon: '🔴', color: '#CD4227', bg: 'from-orange-500/20 to-orange-900/10', border: 'border-orange-500/20', activeBg: '' },
  { id: 'cod', name: 'CALL OF DUTY', mmr: 2700, icon: '💀', color: '#888', bg: 'from-gray-500/10 to-gray-900/10', border: 'border-gray-500/20', activeBg: '' },
  { id: 'fortnite', name: 'FORTNITE', mmr: 2600, icon: '🔵', color: '#00C8FF', bg: 'from-cyan-500/20 to-cyan-900/10', border: 'border-cyan-500/20', activeBg: '' },
  { id: 'r6', name: 'RAINBOW SIX SIEGE', mmr: 2500, icon: '6️⃣', color: '#888', bg: 'from-gray-500/10 to-gray-900/10', border: 'border-gray-500/20', activeBg: '' },
]

const QUEUE_STEPS = [
  { id: 'search', label: 'RECHERCHE' },
  { id: 'found', label: 'JOUEURS TROUVÉS' },
  { id: 'confirm', label: 'CONFIRMATION' },
  { id: 'load', label: 'CHARGEMENT' },
  { id: 'match', label: 'EN MATCH' },
]

const RECENT_PLAYERS = [
  { name: 'NeyZ', mmr: 3210, online: true },
  { name: 'Skyline', mmr: 3180, online: true },
  { name: 'W4rrior', mmr: 3050, online: true },
]

type QueueState = 'idle' | 'searching'

export default function HomePage() {
  console.log('NEW HOMEPAGE v2 LOADED')
  const profile = useAuthStore(s => s.user)
  const [selectedGame, setSelectedGame] = useState(GAMES[0])
  const [queueState, setQueueState] = useState<QueueState>('idle')
  const [searchTime, setSearchTime] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (queueState === 'searching') {
      intervalRef.current = setInterval(() => setSearchTime(t => t + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setSearchTime(0)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [queueState])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // Animated ring progress (simulate time)
  const circumference = 2 * Math.PI * 90
  const progress = Math.min(searchTime / 60, 1)
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: Games list ── */}
      <div className="w-64 flex-shrink-0 bg-surface-400 border-r border-white/[0.06] flex flex-col overflow-y-auto">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-5 pt-5 pb-3">Jeux</p>

        <div className="flex-1 space-y-0.5 px-2">
          {GAMES.map(game => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group ${
                selectedGame.id === game.id
                  ? `bg-gradient-to-r ${game.bg} border ${game.border}`
                  : 'hover:bg-white/5'
              }`}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: selectedGame.id === game.id ? `${game.color}22` : 'rgba(255,255,255,0.05)' }}
              >
                {game.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold truncate ${selectedGame.id === game.id ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                  {game.name}
                </p>
                <p className="text-[10px] text-white/30 mt-0.5">{game.mmr.toLocaleString()} MMR</p>
                <p className="text-[10px] text-green-400 mt-0.5">En ligne</p>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/[0.06]">
          <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors text-xs font-medium">
            <LayoutGrid className="w-4 h-4" />
            Voir tous les jeux
          </button>
        </div>

        {/* Season banner */}
        <div className="mx-3 mb-3 rounded-xl overflow-hidden relative h-24 bg-gradient-to-br from-red-900/60 to-black border border-red-500/20">
          <div className="absolute inset-0 flex flex-col justify-end p-3">
            <p className="text-[10px] text-white/50 font-semibold uppercase tracking-widest">Saison 2</p>
            <p className="text-sm font-black text-brand-500 leading-none">RECHARGED</p>
          </div>
        </div>
      </div>

      {/* ── CENTER: Matchmaking ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-400 relative overflow-hidden px-8 py-8">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full bg-brand-500/5 blur-3xl" />
        </div>

        {/* Game title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-brand-500 text-lg">{selectedGame.icon}</span>
          <p className="text-white/60 font-bold text-sm tracking-widest uppercase">{selectedGame.name}</p>
        </div>

        <h1 className="text-3xl lg:text-4xl font-black text-white text-center mb-1 tracking-tight">
          {queueState === 'idle' ? 'LANCER UNE PARTIE' : 'LANCEMENT DE LA FILE D\'ATTENTE'}
        </h1>
        <p className="text-white/40 text-sm mb-10">
          {queueState === 'idle' ? 'Prêt à affronter la compétition ?' : 'Recherche de partie en cours...'}
        </p>

        {/* Ring */}
        <div className="relative flex items-center justify-center mb-10">
          <svg width="220" height="220" className="-rotate-90">
            {/* Track */}
            <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            {/* Progress */}
            {queueState === 'searching' && (
              <circle
                cx="110" cy="110" r="90"
                fill="none"
                stroke="#e63946"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000"
              />
            )}
            {queueState === 'idle' && (
              <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(230,57,70,0.25)" strokeWidth="6" strokeDasharray="8 6" />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {queueState === 'idle' ? (
              <button
                onClick={() => setQueueState('searching')}
                className="w-28 h-28 rounded-full bg-brand-500 hover:bg-brand-600 transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-brand-500/40 glow-red"
              >
                <span className="text-white font-black text-xs tracking-widest uppercase">Jouer</span>
              </button>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Temps d'attente</p>
                <p className="text-5xl font-black text-white font-mono">{fmt(searchTime)}</p>
                <p className="text-white/30 text-xs mt-1">Temps estimé : 00:45</p>
              </div>
            )}
          </div>
        </div>

        {/* MMR badge */}
        {queueState === 'searching' && (
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xl">{selectedGame.icon}</span>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">MMR Actuel</p>
              <p className="text-2xl font-black text-white">{selectedGame.mmr.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Info row */}
        <div className="flex gap-8 text-center mb-6">
          {[
            { label: 'Mode', value: 'Compétitif' },
            { label: 'Région', value: 'Europe' },
            { label: 'Rôle Préféré', value: 'Duelliste' },
            { label: 'Groupe', value: 'Solo' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">{label}</p>
              <p className="text-sm font-black text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Cancel / Launch */}
        {queueState === 'searching' ? (
          <button
            onClick={() => setQueueState('idle')}
            className="px-10 py-3 border border-brand-500 rounded-lg text-white font-bold text-sm tracking-wider hover:bg-brand-500/10 transition-colors"
          >
            ANNULER LA RECHERCHE
          </button>
        ) : (
          <button
            onClick={() => setQueueState('searching')}
            className="px-10 py-3 bg-brand-500 rounded-lg text-white font-bold text-sm tracking-wider hover:bg-brand-600 transition-colors glow-red"
          >
            TROUVER UNE PARTIE
          </button>
        )}

        {/* Step progress */}
        {queueState === 'searching' && (
          <div className="flex items-center gap-0 mt-10">
            {QUEUE_STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    i === 0
                      ? 'border-brand-500 bg-brand-500/20'
                      : 'border-white/15 bg-transparent'
                  }`}>
                    {i === 0 && <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />}
                  </div>
                  <p className="text-[8px] font-bold text-white/30 uppercase tracking-wider text-center w-16">{step.label}</p>
                  {i === 0 && <p className="text-[8px] text-white/20">En cours</p>}
                </div>
                {i < QUEUE_STEPS.length - 1 && (
                  <div className={`w-10 h-px mb-6 ${i === 0 ? 'bg-brand-500/40' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT: Profile + Queue details ── */}
      <div className="w-72 flex-shrink-0 bg-surface-400 border-l border-white/[0.06] flex flex-col overflow-y-auto">

        {/* Profile */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Profil</p>
            <Link to="/profile" className="text-[10px] font-bold text-brand-500 hover:text-brand-400 uppercase tracking-widest">
              Voir le profil
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar src={profile?.avatar_url} name={profile?.display_name || profile?.username} size="lg" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-black text-white text-sm">{profile?.display_name || profile?.username || 'Player'}</p>
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">✓</span>
                </div>
              </div>
              <p className="text-[10px] text-green-400">● En ligne</p>
            </div>
          </div>

          {/* Rank */}
          <div className="mt-4 flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-white">IMMORTAL 3</p>
              <p className="text-[10px] text-white/40">{selectedGame.mmr.toLocaleString()} MMR</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: 'Matchs', value: '1,248' },
              { label: 'Victoires', value: '712' },
              { label: 'Winrate', value: '57%' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-2 bg-white/[0.03] rounded-lg">
                <p className="text-sm font-black text-white">{value}</p>
                <p className="text-[9px] text-white/30 uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Queue details */}
        {queueState === 'searching' && (
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">File en cours</p>
              <button className="text-[10px] font-bold text-brand-500 hover:text-brand-400 uppercase tracking-widest">Détails</button>
            </div>
            <div className="space-y-2.5">
              {[
                { icon: <span className="text-[11px]">🎮</span>, label: 'Mode', value: 'Compétitif' },
                { icon: <MapPin className="w-3 h-3" />, label: 'Carte', value: 'Aléatoire' },
                { icon: <MapPin className="w-3 h-3" />, label: 'Région', value: 'Europe (Paris)' },
                { icon: <Wifi className="w-3 h-3" />, label: 'Ping', value: '23ms', valueColor: 'text-green-400' },
              ].map(({ icon, label, value, valueColor }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white/40">
                    {icon}
                    <span>{label}</span>
                  </div>
                  <span className={`font-semibold ${valueColor || 'text-white'}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] flex gap-2">
              <Info className="w-3.5 h-3.5 text-white/20 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-white/30 leading-relaxed">
                Plus ton MMR est proche de celui des autres joueurs, plus la recherche sera rapide.
              </p>
            </div>
          </div>
        )}

        {/* Recent players */}
        <div className="p-4 flex-1">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Derniers joueurs rencontrés</p>
          <div className="space-y-2">
            {RECENT_PLAYERS.map(player => (
              <div key={player.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors group">
                <div className="relative">
                  <Avatar name={player.name} size="sm" />
                  {player.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{player.name}</p>
                  <p className="text-[10px] text-white/30">{player.online ? 'En ligne' : 'Hors ligne'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40 font-mono">{player.mmr.toLocaleString()}</span>
                  <button className="w-6 h-6 rounded-full bg-white/[0.05] hover:bg-brand-500/20 hover:text-brand-400 text-white/30 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
