import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import {
  LayoutDashboard, Users, MessageSquare, FileImage, Settings, LogOut,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/chat', icon: MessageSquare, label: 'Chats' },
  { path: '/groups', icon: Users, label: 'Groups' },
  { path: '/media', icon: FileImage, label: 'Media' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function AppLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()

  function initials(name) {
    if (!name) return '?'
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="dark flex h-screen w-screen bg-background text-foreground overflow-hidden">
      {/* Icon rail */}
      <aside className="flex flex-col items-center gap-2 bg-black border-r border-neutral-800 py-4 px-2 w-16 shrink-0">
        {/* Logo */}
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C3AED]">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>

        {/* Nav icons */}
        <nav className="flex flex-col gap-1 w-full items-center">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                title={label}
                onClick={() => navigate(path)}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200
                  ${active
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-900/40'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'}`}
              >
                <Icon className="h-5 w-5" />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-100 opacity-0 transition-opacity group-hover:opacity-100 z-50">
                  {label}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="flex-1" />

        {/* User avatar + logout */}
        <div className="flex flex-col items-center gap-2">
          <button
            title="Logout"
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C3AED] text-white text-xs font-semibold">
            {initials(user?.username)}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
