import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Users, Swords, Shield, Zap, Trophy, Clock, Star, ArrowRight } from 'lucide-react'
import { useMediaSection } from '@/hooks/useMedia'

const GAMES = [
  { name: 'Valorant', players: '128,560', color: 'from-red-600/80 to-rose-900/80', letter: 'V', accent: '#ff4655' },
  { name: 'League of Legends', players: '98,240', color: 'from-amber-500/80 to-yellow-900/80', letter: 'L', accent: '#c89b3c' },
  { name: 'Fortnite', players: '73,120', color: 'from-blue-500/80 to-purple-900/80', letter: 'F', accent: '#00d4ff' },
  { name: 'Apex Legends', players: '56,300', color: 'from-orange-500/80 to-red-900/80', letter: 'A', accent: '#cd4420' },
  { name: 'Call of Duty', players: '42,870', color: 'from-green-600/80 to-emerald-900/80', letter: 'C', accent: '#4ade80' },
]

const LEADERBOARD = [
  { rank: 1, name: 'Zerox', mmr: 3480, online: true },
  { rank: 2, name: 'NeyZ', mmr: 3420, online: false },
  { rank: 3, name: 'Skyline', mmr: 3310, online: true },
  { rank: 4, name: 'W4rrior', mmr: 3220, online: true },
  { rank: 5, name: 'Kirua', mmr: 3150, online: false },
]

const STATS = [
  { value: '128K+', label: 'JOUEURS ACTIFS' },
  { value: '2.4M+', label: 'MATCHS JOUÉS' },
  { value: '58', label: 'JEUX SUPPORTÉS' },
  { value: '24/7', label: 'SUPPORT ACTIF' },
]

const FEATURES = [
  { icon: Swords, title: 'MATCHMAKING ÉQUILIBRÉ', desc: 'Des matchs compétitifs et équitables' },
  { icon: Trophy, title: 'SYSTÈME DE RANKING AVANCÉ', desc: 'Un MMR précis et transparent' },
  { icon: Zap, title: 'MULTI-JEUX', desc: 'Compète sur tes jeux préférés' },
  { icon: Users, title: 'COMMUNAUTÉ ACTIVE', desc: 'Rejoins des milliers de joueurs' },
]

export default function LandingPage() {
  const heroBackground = useMediaSection('hero_background')
  const heroCharacter = useMediaSection('hero_character')
  const gameCoverMap: Record<string, string | null> = {
    Valorant: useMediaSection('game_valorant'),
    'League of Legends': useMediaSection('game_lol'),
    Fortnite: useMediaSection('game_fortnite'),
    'Apex Legends': useMediaSection('game_apex'),
    'Call of Duty': useMediaSection('game_cod'),
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-16 bg-[#080808]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded flex items-center justify-center">
            <span className="font-black text-sm text-white">R</span>
          </div>
          <span className="font-black text-lg tracking-widest">
            <span className="text-white">RUSH</span>
            <span className="text-brand-500"> STACK</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-wider">
          {['ACCUEIL', 'JEUX', 'CLASSEMENTS', 'LIGUES', 'COMMUNAUTÉ', 'À PROPOS'].map((item, i) => (
            <a key={item} href="#" className={`transition-colors ${i === 0 ? 'text-brand-500 border-b-2 border-brand-500 pb-0.5' : 'text-white/60 hover:text-white'}`}>
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:block text-sm font-semibold text-white/70 hover:text-white transition-colors px-4 py-2">
            SE CONNECTER
          </Link>
          <Link to="/register" className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-5 py-2 rounded transition-all active:scale-95">
            S'INSCRIRE
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background glow */}
        {heroBackground && (
          <div className="absolute inset-0 z-0">
            <img src={heroBackground} className="w-full h-full object-cover opacity-20" alt="" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-brand-500/10 to-transparent" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />

        {/* Red vertical accent line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-brand-500/30 to-transparent hidden lg:block" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left content */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-px bg-brand-500" />
              <span className="text-brand-500 text-xs font-bold tracking-[0.3em] uppercase">La Compétition Commence Ici /</span>
              <div className="w-4 h-px bg-brand-500/50" />
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-none tracking-tight mb-6">
              <span className="block text-white">JOUE.</span>
              <span className="block text-white">COMPÈTE.</span>
              <span className="block text-brand-500" style={{ textShadow: '0 0 40px #ff2b2b60' }}>MONTE EN RANK.</span>
            </h1>

            <p className="text-white/50 text-lg leading-relaxed mb-8 max-w-md">
              Rush Stack est la plateforme ultime de matchmaking multi-jeux. Affronte les meilleurs, grimpe les classements et deviens une légende.
            </p>

            <div className="flex items-center gap-4">
              <Link to="/register" className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded transition-all active:scale-95 text-sm tracking-wider uppercase">
                Commencer <ChevronRight className="w-4 h-4" />
              </Link>
              <a href="#games" className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold px-8 py-4 rounded transition-all text-sm tracking-wider uppercase">
                Voir les Jeux
              </a>
            </div>
          </motion.div>

          {/* Right — warrior visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Glow behind */}
            <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-3xl scale-75" />
            <div className="absolute inset-0 bg-brand-500/5 rounded-full blur-[100px]" />

            {/* Hero character image (if uploaded) */}
            {heroCharacter && (
              <img src={heroCharacter} alt="Hero" className="relative w-96 h-96 object-contain drop-shadow-2xl z-10" style={{ filter: 'drop-shadow(0 0 40px #ff2b2b60)' }} />
            )}
            {/* Big R letter as hero visual (fallback) */}
            <div className={`relative w-96 h-96 flex items-center justify-center ${heroCharacter ? 'hidden' : ''}`}>
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border border-brand-500/20 animate-pulse-slow" />
              <div className="absolute inset-4 rounded-full border border-brand-500/10" />

              {/* Big R */}
              <div
                className="text-[280px] font-black text-brand-500/20 select-none leading-none"
                style={{ textShadow: '0 0 80px #ff2b2b80, 0 0 160px #ff2b2b40' }}
              >
                R
              </div>

              {/* Center emblem */}
              <div className="absolute w-24 h-24 bg-brand-500 rounded-full flex items-center justify-center shadow-2xl"
                style={{ boxShadow: '0 0 40px #ff2b2b80, 0 0 80px #ff2b2b40' }}
              >
                <span className="text-4xl font-black text-white">R</span>
              </div>

              {/* Floating stats */}
              <div className="absolute -left-8 top-1/4 glass rounded-lg px-3 py-2 text-xs">
                <p className="text-white/40">Win Rate</p>
                <p className="text-green-400 font-bold">+58.3%</p>
              </div>
              <div className="absolute -right-8 bottom-1/4 glass rounded-lg px-3 py-2 text-xs">
                <p className="text-white/40">MMR</p>
                <p className="text-brand-400 font-bold">3,480</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.06] bg-black/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                </div>
                <div>
                  <p className="text-xl font-black text-white">{stat.value}</p>
                  <p className="text-[10px] text-white/40 tracking-wider">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games + Leaderboard */}
      <section id="games" className="py-16 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Games */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold tracking-[0.2em] text-white uppercase">Jeux Populaires</h2>
              <a href="#" className="text-xs text-brand-500 hover:text-brand-400 font-semibold tracking-wider flex items-center gap-1">
                VOIR TOUS LES JEUX <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {GAMES.map((game, i) => (
                <motion.div
                  key={game.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group relative overflow-hidden rounded-xl cursor-pointer aspect-[3/4]"
                >
                  {/* Game background */}
                  {gameCoverMap[game.name] ? (
                    <img src={gameCoverMap[game.name]!} alt={game.name} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-b ${game.color}`} />
                  )}
                  <div className="absolute inset-0 bg-black/40" />

                  {/* Game letter (fallback) */}
                  {!gameCoverMap[game.name] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-8xl font-black opacity-20 group-hover:opacity-30 transition-opacity" style={{ color: game.accent }}>
                        {game.letter}
                      </span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 rounded-xl transition-all" />

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs font-bold text-white leading-tight">{game.name}</p>
                    <p className="text-[10px] text-white/50 mt-0.5">{game.players} joueurs</p>
                  </div>

                  {/* Online dot */}
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-400" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold tracking-[0.2em] text-white uppercase">Classement Global</h2>
              <Link to="/leaderboard" className="text-xs text-brand-500 hover:text-brand-400 font-semibold tracking-wider">
                VOIR LE CLASSEMENT
              </Link>
            </div>
            <div className="space-y-2">
              {LEADERBOARD.map((player, i) => (
                <motion.div
                  key={player.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 bg-surface-200 border border-white/[0.06] rounded-lg px-4 py-3 hover:border-white/20 transition-all group cursor-pointer"
                >
                  <span className={`text-sm font-black w-5 ${player.rank === 1 ? 'text-[#ffd700]' : player.rank === 2 ? 'text-[#c0c0c0]' : player.rank === 3 ? 'text-[#cd7f32]' : 'text-white/30'}`}>
                    #{player.rank}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-surface-100 border border-white/10 flex items-center justify-center relative flex-shrink-0">
                    <span className="text-xs font-bold text-white/60">{player.name[0]}</span>
                    <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-surface-200 ${player.online ? 'bg-green-400' : 'bg-gray-600'}`} />
                  </div>
                  <span className="flex-1 text-sm font-semibold text-white">{player.name}</span>
                  <span className="text-xs font-mono font-bold text-brand-400">{player.mmr.toLocaleString()} MMR</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.06]">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="px-6 py-8 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-brand-500" />
                </div>
                <p className="text-xs font-bold tracking-wider text-white">{f.title}</p>
                <p className="text-xs text-white/40">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-brand-500/5 to-transparent" />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-xs text-brand-500 font-bold tracking-widest uppercase mb-2">Prêt à dominer ?</p>
            <h2 className="text-3xl lg:text-4xl font-black text-white">Rejoins la compétition <span className="text-brand-500">maintenant</span></h2>
          </div>
          <Link to="/register" className="flex-shrink-0 flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-10 py-4 rounded transition-all active:scale-95 text-sm tracking-widest uppercase">
            S'INSCRIRE GRATUITEMENT <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center">
              <span className="font-black text-xs text-white">R</span>
            </div>
            <span className="font-black text-sm tracking-widest text-white/50">RUSH STACK</span>
          </div>
          <p className="text-xs text-white/20">© 2025 Rush Stack. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
