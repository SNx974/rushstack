import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

interface AppLayoutProps {
  children?: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation()
  const isFullscreen = pathname === '/' || pathname === '/dashboard'

  return (
    <div className="flex h-screen bg-surface-400 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-56 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-hidden pb-20 lg:pb-0">
          {isFullscreen ? (
            <div className="h-full overflow-hidden">
              {children ?? <Outlet />}
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="max-w-6xl mx-auto p-4 lg:p-6 min-h-full">
                {children ?? <Outlet />}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
