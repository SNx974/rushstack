import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import AppLayout from '@/components/layout/AppLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import UnifiedHomePage from '@/pages/UnifiedHomePage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import PlayPage from '@/pages/PlayPage'
import ProfilePage from '@/pages/ProfilePage'
import SocialPage from '@/pages/SocialPage'
import AdminPage from '@/pages/admin/AdminPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

function PageLoader() {
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <PageLoader />
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const init = useAuthStore(s => s.init)
  useEffect(() => { init() }, [init])

  return (
    <Routes>
      {/* Homepage unifiée : landing ou lobby selon auth */}
      <Route path="/" element={<UnifiedHomePage />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />

      {/* Auth */}
      <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Play page — full screen, no sidebar */}
      <Route path="/play" element={<ProtectedRoute><PlayPage /></ProtectedRoute>} />

      {/* App */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/:section" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
