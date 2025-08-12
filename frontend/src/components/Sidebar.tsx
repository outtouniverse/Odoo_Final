import { useRouter } from '../utils/router'
import { useAuth } from '../utils/auth'

type SidebarProps = {
  open?: boolean
  onClose?: () => void
}

const baseNavItems = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"><path strokeWidth="1.5" d="M3 12h8V3H3v9Zm10 9h8v-7h-8v7Zm0-9h8V3h-8v9Zm-10 9h8v-7H3v7Z"/></svg>
  ) },
  { key: 'trips', label: 'My Trips', to: '/trips', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"/></svg>
  ) },
  { key: 'explore', label: 'Explore Cities', to: '/cities', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7" strokeWidth="1.5"/><path strokeWidth="1.5" strokeLinecap="round" d="M21 21l-3.8-3.8"/></svg>
  ) },
  { key: 'budget', label: 'Budget', to: '/dashboard#budget', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"><path strokeWidth="1.5" d="M4 6h16v12H4z"/><path strokeWidth="1.5" d="M8 14h1.5M8 10h8M12 14h4"/></svg>
  ) },
  { key: 'settings', label: 'Settings', to: '/profile', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05A1.8 1.8 0 0 0 15 19.4l-.23-.06a1.8 1.8 0 0 0-1.54.52l-.04.04a2 2 0 1 1-2.83-2.83l.04-.04a1.8 1.8 0 0 0 .52-1.54L10.6 15a1.8 1.8 0 0 0-1-.99l-.23-.06a1.8 1.8 0 0 0-1.31.17l-.06.03a2 2 0 1 1-1.9-3.54l.06-.02a1.8 1.8 0 0 0 1.15-1.28L7 8.6a1.8 1.8 0 0 0-.36-1.98l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.8 1.8 0 0 0 9 4.6l.23.06c.52.13 1.07 0 1.46-.39l.04-.04a2 2 0 1 1 2.83 2.83l-.04.04c-.39.39-.52.94-.39 1.46l.06.23c.16.57.66 1 1.26 1.15l.23.06c.52.13 1.07 0 1.46-.39l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05c-.39.39-.52.94-.39 1.46l.06.23z"/></svg>
  ) },
]

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const { path, navigate } = useRouter()
  const { isAuthenticated, hasRole } = useAuth()
  const navItems = [...baseNavItems]
  if (isAuthenticated && hasRole('super_admin')) {
    navItems.push({ key: 'admin', label: 'Admin', to: '/admin', icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.09 6.26H21l-5.17 3.76L17.91 21 12 16.97 6.09 21l2.08-7.98L3 9.26h6.91L12 3z"/></svg>
    ) })
  }
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <button onClick={onClose} className="fixed inset-0 z-30 bg-black/10 backdrop-blur-sm lg:hidden" aria-label="Close sidebar" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-neutral-200 bg-white p-4 transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-4 hidden lg:block">
          <a href="#" className="text-sm font-semibold tracking-tight text-neutral-900">Navigation</a>
        </div>
        <nav className="space-y-1 text-sm text-neutral-700">
          {navItems.map((item) => {
            const isActive = path.replace(/#.*$/, '') === item.to
            return (
              <button
                key={item.key}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 transition hover:bg-neutral-50 ${isActive ? 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100' : ''}`}
                onClick={() => navigate(item.to)}
              >
                <span className="text-neutral-600">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}


