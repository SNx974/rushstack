import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

export default function AppLayout() {
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
          <div className="h-full overflow-y-auto">
            <div className="max-w-6xl mx-auto p-4 lg:p-6 min-h-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
