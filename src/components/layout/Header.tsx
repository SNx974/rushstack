import { useState } from 'react'
import { Bell, Menu, Search, X, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/stores/auth.store'
import { Sidebar } from './Sidebar'

export function Header() {
  const profile = useAuthStore(s => s.user)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14 bg-surface-300/80 backdrop-blur-md border-b border-white/[0.06] lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-1.5 flex-1">
          <div className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" fill="currentColor" />
          </div>
          <span className="font-black text-sm tracking-widest">
            <span className="text-white">RUSH</span>
            <span className="text-brand-500">STACK</span>
          </span>
        </Link>
        <Avatar src={profile?.avatar_url} name={profile?.display_name || profile?.username} size="sm" />
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 shadow-2xl">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-surface-200 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  )
}
