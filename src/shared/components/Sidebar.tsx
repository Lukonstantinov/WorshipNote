import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, ListMusic, Guitar, Settings, Mic } from 'lucide-react'

const NAV = [
  { to: '/library',  label: 'library',  Icon: BookOpen },
  { to: '/setlists', label: 'setlists', Icon: ListMusic },
  { to: '/chords',   label: 'chordLibrary', Icon: Guitar },
  { to: '/pitch',    label: 'pitchDetection', Icon: Mic },
  { to: '/settings', label: 'settings', Icon: Settings },
]

export function Sidebar() {
  const { t } = useTranslation()

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex flex-col w-56 h-full border-r"
        style={{ backgroundColor: 'var(--color-nav-bg)', borderColor: 'var(--color-border)' }}
      >
        <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h1 className="text-base font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            WorshipHub
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
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
                  isActive ? '' : 'hover:opacity-80'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-primary)' }
                  : { color: 'var(--color-text-tertiary)' }
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2 : 1.5}
                    style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
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
          backgroundColor: 'var(--color-nav-blur-bg)',
          borderColor: 'var(--color-border)',
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
                isActive ? '' : ''
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}
                />
                <span style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)', fontSize: 10 }}>
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
