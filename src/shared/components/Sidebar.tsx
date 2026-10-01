import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { WNLogo } from './WNLogo'
import { NAV, isNavActive, sectionVars } from './navItems'
import { alpha } from '../lib/color'
import { APP_VERSION } from '../lib/version'

export function Sidebar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex flex-col w-60 h-full border-r flex-shrink-0"
        style={{ backgroundColor: 'var(--color-nav-bg)', borderColor: 'var(--color-border)' }}
      >
        <div className="px-5 py-5 flex items-center gap-3">
          <WNLogo size={36} />
          <div>
            <h1 className="text-base font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              WorshipNote
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
              {t('appTagline')}
            </p>
          </div>
        </div>
        <div className="flex-1 py-2 space-y-1">
          {NAV.map((item) => {
            const active = isNavActive(item, pathname)
            const { c1, grad } = sectionVars(item.color)
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all mx-3 rounded-2xl hover-bg"
                style={{
                  backgroundColor: active ? alpha(c1, 14) : undefined,
                  color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                }}
              >
                <span
                  className="flex items-center justify-center rounded-xl flex-shrink-0 transition-all"
                  style={{
                    width: 32,
                    height: 32,
                    background: active ? grad : alpha(c1, 14),
                    color: active ? '#fff' : c1,
                    boxShadow: active ? `0 4px 12px ${alpha(c1, 40)}` : undefined,
                  }}
                >
                  <item.Icon size={17} strokeWidth={2} />
                </span>
                <span>{t(item.label)}</span>
              </Link>
            )
          })}
        </div>
        <p className="px-5 py-4 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          v{APP_VERSION}
        </p>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="tabbar md:hidden fixed bottom-0 left-0 right-0 flex border-t z-50"
        style={{
          backgroundColor: 'var(--color-nav-blur-bg)',
          borderColor: 'var(--color-border)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {NAV.map((item) => {
          const active = isNavActive(item, pathname)
          const { c1, grad } = sectionVars(item.color)
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95"
              style={{ height: 'var(--tabbar-h)' }}
            >
              <span
                className="flex items-center justify-center rounded-full transition-all"
                style={{
                  width: 48,
                  height: 28,
                  background: active ? grad : 'transparent',
                  color: active ? '#fff' : 'var(--color-text-tertiary)',
                  boxShadow: active ? `0 3px 10px ${alpha(c1, 40)}` : undefined,
                }}
              >
                <item.Icon size={19} strokeWidth={active ? 2.2 : 1.7} />
              </span>
              <span
                className="font-medium truncate max-w-full px-1"
                style={{ color: active ? c1 : 'var(--color-text-tertiary)', fontSize: 10.5 }}
              >
                {t(item.label)}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
