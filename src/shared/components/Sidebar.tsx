import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, ListMusic, Guitar, Settings } from 'lucide-react'

const NAV = [
  { to: '/library',  label: 'library',  Icon: BookOpen },
  { to: '/setlists', label: 'setlists', Icon: ListMusic },
  { to: '/chords',   label: 'chordLibrary', Icon: Guitar },
  { to: '/settings', label: 'settings', Icon: Settings },
]

export function Sidebar() {
  const { t } = useTranslation()

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex flex-col w-56 h-full border-r"
        style={{ backgroundColor: '#111111', borderColor: '#2c2c2e' }}
      >
        <div className="px-5 py-5 border-b" style={{ borderColor: '#2c2c2e' }}>
          <h1 className="text-base font-semibold tracking-tight" style={{ color: '#ffffff' }}>
            WorshipHub
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(235,235,245,0.4)' }}>
            Псалмы и аккорды
          </p>
        </div>
        <div className="flex-1 py-2">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all mx-2 rounded-xl ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: '#2c2c2e', color: '#ffffff' } : {}
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2 : 1.5}
                    style={{ color: isActive ? '#bf5af2' : 'rgba(235,235,245,0.5)' }}
                  />
                  <span>{t(label)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex border-t z-50"
        style={{
          backgroundColor: 'rgba(17,17,17,0.92)',
          borderColor: '#2c2c2e',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-all ${
                isActive ? 'text-white' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{ color: isActive ? '#bf5af2' : 'rgba(235,235,245,0.4)' }}
                />
                <span style={{ color: isActive ? '#bf5af2' : 'rgba(235,235,245,0.4)', fontSize: 10 }}>
                  {t(label)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
