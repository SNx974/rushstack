import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, MapPin, Wifi, Info, Plus, Users, Swords, Zap, Clock, Star, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { Avatar } from '@/components/ui/Avatar'
import { useSiteIcons } from '@/hooks/useSiteIcons'
import { useMediaSection } from '@/hooks/useMedia'

const GAMES = [
  { id: 'valorant', name: 'VALORANT', mmr: 3250, icon: '🎯', color: '#FF4655', border: 'border-red-500/40', bg: 'from-red-500/20 to-red-900/10' },
  { id: 'lol', name: 'LEAGUE OF LEGENDS', mmr: 2850, icon: '⚔️', color: '#C89B3C', border: 'border-amber-500/20', bg: 'from-amber-500/20 to-amber-900/10' },
  { id: 'apex', name: 'APEX LEGENDS', mmr: 2950, icon: '🔴', color: '#CD4227', border: 'border-orange-500/20', bg: 'from-orange-500/20 to-orange-900/10' },
  { id: 'cod', name: 'CALL OF DUTY', mmr: 2700, icon: '💀', color: '#888', border: 'border-gray-500/20', bg: 'from-gray-500/10 to-gray-900/10' },
  { id: 'fortnite', name: 'FORTNITE', mmr: 2600, icon: '🔵', color: '#00C8FF', border: 'border-cyan-500/20', bg: 'from-cyan-500/20 to-cyan-900/10' },
  { id: 'r6', name: 'RAINBOW SIX SIEGE', mmr: 2500, icon: '6️⃣', color: '#888', border: 'border-gray-500/20', bg: 'from-gray-500/10 to-gray-900/10' },
]

const STATS = [
  { value: '128K+', label: 'JOUEURS ACTIFS' },
  { value: '2.4M+', label: 'MATCHS JOUÉS' },
  { value: '58', label: 'JEUX SUPPORTÉS' },
  { value: '24/7', label: 'SUPPORT ACTIF' },
]

const LEADERBOARD = [
  { rank: 1, name: 'Zerox', mmr: 3480, online: true },
  { rank: 2, name: 'NeyZ', mmr: 3420, online: false },
  { rank: 3, name: 'Skyline', mmr: 3310, online: true },
  { rank: 4, name: 'W4rrior', mmr: 3220, online: true },
  { rank: 5, name: 'Kirua', mmr: 3150, online: false },
]

const RECENT_PLAYERS = [
  { name: 'NeyZ', mmr: 3210, online: true },
  { name: 'Skyline', mmr: 3180, online: true },
  { name: 'W4rrior', mmr: 3050, online: true },
]

const QUEUE_STEPS = ['RECHERCHE', 'JOUEURS TROUVÉS', 'CONFIRMATION', 'CHARGEMENT', 'EN MATCH']

type QueueState = 'idle' | 'searching'

// ─── LOBBY (logged-in view) ───────────────────────────────────────────────────
function LobbyView() {
  const profile = useAuthStore(s => s.user)
  const signOut = useAuthStore(s => s.signOut)
  const navigate = useNavigate()
  const { navbarIcon } = useSiteIcons()
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
  const circumference = 2 * Math.PI * 90
  const dashOffset = circumference * (1 - Math.min(searchTime / 60, 1))

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-[#080808] text-white overflow-hidden">

      {/* ── LEFT: Games + Nav ── */}
      <div className="w-60 flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0d0d0d]">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
          <div className="w-7 h-7 bg-brand-500 rounded flex items-center justify-center overflow-hidden">
            {navbarIcon
              ? <img src={navbarIcon} className="w-full h-full object-contain" alt="logo" />
              : <span className="font-black text-xs text-white">R</span>}
          </div>
          <span className="font-black text-sm tracking-widest">
            <span className="text-white">RUSH</span><span className="text-brand-500">STACK</span>
          </span>
        </div>

        {/* Nav links */}
        <div className="px-3 py-3 border-b border-white/[0.06] space-y-0.5">
          {[
            { label: 'Accueil', to: '/', active: true },
            { label: 'Classements', to: '/leaderboard', active: false },
            { label: 'Social', to: '/social', active: false },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                item.active ? 'bg-brand-500/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Games list */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest px-3 mb-2">Jeux</p>
          {GAMES.map(game => (
            <button key={game.id} onClick={() => setSelectedGame(game)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group mb-0.5 ${
                selectedGame.id === game.id
                  ? `bg-gradient-to-r ${game.bg} border ${game.border}`
                  : 'hover:bg-white/[0.04]'
              }`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ background: selectedGame.id === game.id ? `${game.color}22` : 'rgba(255,255,255,0.05)' }}>
                {game.icon}
              </div>
              <div className="min-w-0">
                <p className={`text-[10px] font-bold truncate ${selectedGame.id === game.id ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
                  {game.name}
                </p>
                <p className="text-[9px] text-white/25 mt-0.5">{game.mmr.toLocaleString()} MMR</p>
                <p className="text-[9px] text-green-400">En ligne</p>
              </div>
            </button>
          ))}
        </div>

        {/* Saison */}
        <div className="mx-3 mb-3 rounded-xl overflow-hidden h-20 bg-gradient-to-br from-red-900/60 to-black border border-red-500/20 flex-shrink-0 relative">
          <div className="absolute inset-0 flex flex-col justify-end p-3">
            <p className="text-[9px] text-white/40 font-semibold uppercase tracking-widest">Saison 2</p>
            <p className="text-sm font-black text-brand-500 leading-none">RECHARGED</p>
          </div>
        </div>

        {/* User */}
        <div className="border-t border-white/[0.06] p-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
            <Avatar src={profile?.avatar_url} name={profile?.display_name || profile?.username} size="sm" online />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{profile?.display_name || profile?.username}</p>
              <p className="text-[9px] text-white/30">@{profile?.username}</p>
            </div>
            <button onClick={handleSignOut} className="opacity-0 group-hover:opacity-100 text-[9px] text-white/30 hover:text-red-400 transition-all">
              Quitter
            </button>
          </div>
        </div>
      </div>

      {/* ── CENTER: Matchmaking ── */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-8">
        {/* BG glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-brand-500/[0.04] blur-3xl" />
        </div>

        {/* Big background R */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[32rem] font-black text-white/[0.015] leading-none">R</span>
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
          {/* Game badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{selectedGame.icon}</span>
            <p className="text-white/50 font-bold text-xs tracking-widest uppercase">{selectedGame.name}</p>
          </div>

          <h1 className="text-3xl lg:text-5xl font-black text-white text-center mb-2 tracking-tight leading-none">
            {queueState === 'idle' ? (
              <>JOUE.<br /><span className="text-brand-500">COMPÈTE.</span></>
            ) : (
              'RECHERCHE EN COURS'
            )}
          </h1>
          <p className="text-white/30 text-sm mb-10 text-center">
            {queueState === 'idle' ? 'Prêt à affronter la compétition ?' : 'Recherche de partie en cours...'}
          </p>

          {/* Ring */}
          <div className="relative flex items-center justify-center mb-8">
            <svg width="200" height="200" className="-rotate-90">
              <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
              {queueState === 'searching' ? (
                <circle cx="100" cy="100" r="85" fill="none" stroke="#e63946" strokeWidth="5"
                  strokeLinecap="round" strokeDasharray={2 * Math.PI * 85}
                  strokeDashoffset={2 * Math.PI * 85 * (1 - Math.min(searchTime / 60, 1))}
                  className="transition-all duration-1000" />
              ) : (
                <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(230,57,70,0.2)"
                  strokeWidth="5" strokeDasharray="6 5" />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {queueState === 'idle' ? (
                <button onClick={() => setQueueState('searching')}
                  className="w-24 h-24 rounded-full bg-brand-500 hover:bg-brand-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-xl shadow-brand-500/40"
                  style={{ boxShadow: '0 0 40px rgba(230,57,70,0.5)' }}>
                  <span className="text-white font-black text-xs tracking-widest">JOUER</span>
                </button>
              ) : (
                <div className="flex flex-col items-center">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Temps d'attente</p>
                  <p className="text-4xl font-black text-white font-mono">{fmt(searchTime)}</p>
                  <p className="text-white/20 text-[10px] mt-1">Estimé : 00:45</p>
                </div>
              )}
            </div>
          </div>

          {/* Info row */}
          <div className="flex gap-8 text-center mb-6">
            {[['Mode', 'Compétitif'], ['Région', 'Europe'], ['Rôle', 'Duelliste'], ['Groupe', 'Solo']].map(([k, v]) => (
              <div key={k}>
                <p className="text-[9px] text-white/25 uppercase tracking-widest">{k}</p>
                <p className="text-xs font-black text-white mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {/* Button */}
          {queueState === 'searching' ? (
            <button onClick={() => setQueueState('idle')}
              className="px-8 py-2.5 border border-brand-500/60 rounded-lg text-white text-xs font-bold tracking-wider hover:bg-brand-500/10 transition-colors">
              ANNULER LA RECHERCHE
            </button>
          ) : (
            <button onClick={() => setQueueState('searching')}
              className="px-8 py-2.5 bg-brand-500 rounded-lg text-white text-xs font-bold tracking-wider hover:bg-brand-600 transition-colors"
              style={{ boxShadow: '0 0 20px rgba(230,57,70,0.4)' }}>
              TROUVER UNE PARTIE
            </button>
          )}

          {/* Steps */}
          {queueState === 'searching' && (
            <div className="flex items-center gap-0 mt-8">
              {QUEUE_STEPS.map((step, i) => (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${i === 0 ? 'border-brand-500 bg-brand-500/20' : 'border-white/10'}`}>
                      {i === 0 && <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />}
                    </div>
                    <p className="text-[7px] font-bold text-white/20 uppercase tracking-wider text-center w-14">{step}</p>
                  </div>
                  {i < QUEUE_STEPS.length - 1 && <div className={`w-8 h-px mb-5 ${i === 0 ? 'bg-brand-500/30' : 'bg-white/8'}`} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Profile + Stats ── */}
      <div className="w-64 flex-shrink-0 flex flex-col border-l border-white/[0.06] bg-[#0d0d0d] overflow-y-auto">

        {/* Profile */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest">Profil</p>
            <Link to="/profile" className="text-[9px] font-bold text-brand-500 hover:text-brand-400 uppercase tracking-widest">
              Voir le profil
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Avatar src={profile?.avatar_url} name={profile?.display_name || profile?.username} size="lg" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0d0d0d]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="font-black text-white text-sm">{profile?.display_name || profile?.username}</p>
                <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-[7px] text-white font-bold">✓</span>
                </div>
              </div>
              <p className="text-[10px] text-green-400">● En ligne</p>
            </div>
          </div>

          {/* Rank */}
          <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.05] mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-white">IMMORTAL 3</p>
              <p className="text-[10px] text-white/30">{selectedGame.mmr.toLocaleString()} MMR</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1.5">
            {[['1,248', 'Matchs'], ['712', 'Victoires'], ['57%', 'Winrate']].map(([v, l]) => (
              <div key={l} className="text-center p-2 bg-white/[0.03] rounded-lg">
                <p className="text-sm font-black text-white">{v}</p>
                <p className="text-[8px] text-white/25 uppercase">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Queue info */}
        {queueState === 'searching' && (
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest">File en cours</p>
              <span className="text-[9px] font-bold text-brand-500">Détails</span>
            </div>
            <div className="space-y-2">
              {[
                ['🎮', 'Mode', 'Compétitif', ''],
                ['📍', 'Région', 'Europe (Paris)', ''],
                ['📶', 'Ping', '23ms', 'text-green-400'],
              ].map(([icon, label, value, color]) => (
                <div key={label} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 text-white/35">{icon} {label}</div>
                  <span className={`font-semibold ${color || 'text-white'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classement */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest">Top Joueurs</p>
            <Link to="/leaderboard" className="text-[9px] text-brand-500 hover:text-brand-400">Voir tout</Link>
          </div>
          <div className="space-y-2">
            {LEADERBOARD.map(p => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="text-[9px] font-black text-white/20 w-3">{p.rank}</span>
                <div className="relative">
                  <Avatar name={p.name} size="xs" />
                  {p.online && <div className="absolute -bottom-px -right-px w-2 h-2 bg-green-500 rounded-full border border-[#0d0d0d]" />}
                </div>
                <p className="flex-1 text-[10px] font-semibold text-white/70 truncate">{p.name}</p>
                <p className="text-[9px] font-mono text-white/30">{p.mmr.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Derniers joueurs */}
        <div className="p-4 flex-1">
          <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-3">Derniers Rencontrés</p>
          <div className="space-y-2">
            {RECENT_PLAYERS.map(p => (
              <div key={p.name} className="flex items-center gap-2 group">
                <div className="relative">
                  <Avatar name={p.name} size="xs" />
                  <div className="absolute -bottom-px -right-px w-2 h-2 bg-green-500 rounded-full border border-[#0d0d0d]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white/70 truncate">{p.name}</p>
                  <p className="text-[9px] text-white/25">En ligne</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-mono text-white/30">{p.mmr.toLocaleString()}</span>
                  <button className="w-5 h-5 rounded-full bg-white/5 hover:bg-brand-500/20 text-white/20 hover:text-brand-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Plus className="w-2.5 h-2.5" />
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

// ─── LANDING (logged-out view) ────────────────────────────────────────────────
function LandingView() {
  const { navbarIcon } = useSiteIcons()
  const heroCharacter = useMediaSection('hero_character')

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-16 bg-[#080808]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded flex items-center justify-center overflow-hidden">
            {navbarIcon ? <img src={navbarIcon} className="w-full h-full object-contain" alt="logo" /> : <span className="font-black text-sm text-white">R</span>}
          </div>
          <span className="font-black text-lg tracking-widest"><span className="text-white">RUSH</span><span className="text-brand-500">STACK</span></span>
        </div>
        <div className="hidden lg:flex items-center gap-8">
          {['ACCUEIL', 'JEUX', 'CLASSEMENTS', 'LIGUES', 'COMMUNAUTÉ', 'À PROPOS'].map(item => (
            <a key={item} href="#" className="text-xs font-semibold text-white/50 hover:text-white tracking-widest transition-colors">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-xs font-semibold text-white/60 hover:text-white tracking-wider transition-colors">SE CONNECTER</Link>
          <Link to="/register" className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded tracking-wider transition-colors">S'INSCRIRE</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center">
            <div className="absolute w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
            <div className="relative z-10 text-[20rem] font-black text-white/[0.03] leading-none select-none">R</div>
            {heroCharacter && (
              <img src={heroCharacter} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />
            )}
            {/* Floating stats */}
            <div className="absolute top-1/3 left-8 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 z-20">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Win Rate</p>
              <p className="text-green-400 font-black text-sm">+58.3%</p>
            </div>
            <div className="absolute bottom-1/3 right-8 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 z-20">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">MMR</p>
              <p className="text-white font-black text-sm">3,480</p>
            </div>
          </div>
        </div>

        <div className="relative z-20 px-6 lg:px-12 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-brand-500" />
            <p className="text-[10px] font-bold text-brand-500 tracking-widest uppercase">La compétition commence ici /</p>
            <div className="h-px w-8 bg-brand-500" />
          </div>
          <h1 className="text-6xl lg:text-8xl font-black leading-none mb-6">
            <span className="text-white block">JOUE.</span>
            <span className="text-white block">COMPÈTE.</span>
            <span className="text-brand-500 block">MONTE EN<br />RANK.</span>
          </h1>
          <p className="text-white/40 text-base mb-8 leading-relaxed max-w-md">
            Rush Stack est la plateforme ultime de matchmaking multi-jeux. Affronte les meilleurs, grimpe les classements et deviens une légende.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/register" className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded transition-colors tracking-wider"
              style={{ boxShadow: '0 0 30px rgba(230,57,70,0.4)' }}>
              COMMENCER <ChevronRight className="w-4 h-4" />
            </Link>
            <button className="px-6 py-3 border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-bold text-sm rounded transition-colors tracking-wider">
              VOIR LES JEUX
            </button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-y border-white/[0.06] bg-white/[0.02] py-6">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
              <div>
                <p className="text-lg font-black text-white">{value}</p>
                <p className="text-[10px] text-white/30 tracking-wider">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-[10px] text-brand-500 font-bold tracking-widest uppercase mb-4">Rejoins la compétition</p>
          <h2 className="text-4xl font-black text-white mb-4">PRÊT À DOMINER ?</h2>
          <p className="text-white/40 mb-8">Crée ton compte gratuitement et rejoins des milliers de joueurs.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-black text-sm rounded tracking-wider transition-colors">
            COMMENCER MAINTENANT <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6 lg:px-12 flex items-center justify-between">
        <span className="font-black text-sm tracking-widest"><span className="text-white">RUSH</span><span className="text-brand-500">STACK</span></span>
        <p className="text-white/20 text-xs">© 2026 Rush Stack. Tous droits réservés.</p>
      </footer>
    </div>
  )
}

// ─── SMART HOME ───────────────────────────────────────────────────────────────
export default function UnifiedHomePage() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-2xl font-black tracking-widest">
            <span className="text-white">RUSH</span><span className="text-brand-500">STACK</span>
          </div>
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return isAuthenticated ? <LobbyView /> : <LandingView />
}
