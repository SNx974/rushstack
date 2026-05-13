import { Outlet } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface-400 bg-grid-pattern flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center glow-red">
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <div className="text-2xl font-black tracking-widest">
            <span className="text-white">RUSH</span>
            <span className="text-brand-500">STACK</span>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  )
}
