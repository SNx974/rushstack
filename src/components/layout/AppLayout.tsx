import { Outlet } from 'react-router-dom'
import EsportSidebar from './EsportSidebar'

interface AppLayoutProps {
  children?: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <EsportSidebar />
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {children ?? <Outlet />}
      </main>
    </div>
  )
}
