import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const NAV = [
  { to: '/library', label: 'library', icon: '📖' },
  { to: '/setlists', label: 'setlists', icon: '📋' },
  { to: '/settings', label: 'settings', icon: '⚙️' },
]

export function Sidebar() {
  const { t } = useTranslation()

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex flex-col w-56 h-full border-r"
        style={{ backgroundColor: '#1a1a2e', borderColor: '#2d2d4e' }}
      >
        <div className="px-4 py-5 border-b" style={{ borderColor: '#2d2d4e' }}>
          <h1 className="text-lg font-bold" style={{ color: '#a78bfa' }}>WorshipHub</h1>
          <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Псалмы и аккорды</p>
        </div>
        <div className="flex-1 py-2">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: '#2d2d4e', color: '#a78bfa' } : {}
              }
            >
              <span>{icon}</span>
              <span>{t(label)}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex border-t z-50"
        style={{ backgroundColor: '#1a1a2e', borderColor: '#2d2d4e' }}
      >
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs ${
                isActive ? 'text-purple-400' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl">{icon}</span>
            <span>{t(label)}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
