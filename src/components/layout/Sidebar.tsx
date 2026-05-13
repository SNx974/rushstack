import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Trophy, Swords, Users, Bell, Shield, LogOut, Settings, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { Avatar } from '@/components/ui/Avatar'

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard', exact: true },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/play', icon: Swords, label: 'Play Now' },
  { to: '/social', icon: Users, label: 'Social' },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const profile = useAuthStore(s => s.user)
  const signOut = useAuthStore(s => s.signOut)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="h-full flex flex-col bg-surface-300 border-r border-white/[0.06]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center glow-red">
          <Zap className="w-4 h-4 text-white" fill="currentColor" />
        </div>
        <div>
          <span className="font-black text-sm tracking-widest text-white">RUSH</span>
          <span className="font-black text-sm tracking-widest text-brand-500">STACK</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 mb-2">Menu</p>
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={onClose}
            className={({ isActive }) =>
              cn('sidebar-item', isActive && 'sidebar-item-active')
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}

        {profile?.role === 'admin' || profile?.role === 'moderator' ? (
          <>
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 mt-4 mb-2">Admin</p>
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                cn('sidebar-item', isActive && 'sidebar-item-active')
              }
            >
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Admin Panel</span>
            </NavLink>
          </>
        ) : null}
      </nav>

      {/* User section */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
          <Avatar src={profile?.avatar_url} name={profile?.display_name || profile?.username} size="sm" online />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile?.display_name || profile?.username}</p>
            <p className="text-xs text-white/40 truncate">@{profile?.username}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-all"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
