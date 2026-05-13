import { NavLink } from 'react-router-dom'
import { Home, Trophy, Swords, Users, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home', exact: true },
  { to: '/leaderboard', icon: Trophy, label: 'Ranks' },
  { to: '/play', icon: Swords, label: 'Play' },
  { to: '/social', icon: Users, label: 'Social' },
]

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-300/95 backdrop-blur-md border-t border-white/[0.06] lg:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-all',
                isActive ? 'text-brand-400' : 'text-white/40 hover:text-white/70',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
