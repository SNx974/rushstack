import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import AppLayout from '@/components/layout/AppLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import LandingPage from '@/pages/LandingPage'
import HomePage from '@/pages/HomePage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import PlayPage from '@/pages/PlayPage'
import ProfilePage from '@/pages/ProfilePage'
import SocialPage from '@/pages/SocialPage'
import AdminPage from '@/pages/admin/AdminPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

function PageLoader() {
  return (
    <div className="min-h-screen bg-surface-400 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-2xl font-black tracking-widest text-gradient">RUSH STACK</div>
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

// Smart homepage: dashboard si connecté, landing sinon
function SmartHome() {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <PageLoader />
  if (isAuthenticated) {
    return (
      <AppLayout>
        <HomePage />
      </AppLayout>
    )
  }
  return <LandingPage />
}

export default function App() {
  const init = useAuthStore(s => s.init)

  useEffect(() => { init() }, [init])

  return (
    <Routes>
      {/* Smart homepage */}
      <Route path="/" element={<SmartHome />} />

      {/* Auth routes */}
      <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* App routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/play" element={<PlayPage />} />
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
