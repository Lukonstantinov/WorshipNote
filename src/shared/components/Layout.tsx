import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../../store/settingsStore'
import '../../shared/styles/themes.css'

export function Layout() {
  const { theme, language } = useSettingsStore()
  const { i18n } = useTranslation()

  // Restore the saved UI language (i18n always boots in Russian)
  useEffect(() => {
    if (i18n.language !== language) i18n.changeLanguage(language)
    document.documentElement.lang = language
  }, [language, i18n])

  // Apply theme class to <html>
  useEffect(() => {
    const html = document.documentElement
    html.className = html.className.replace(/theme-\w+/g, '').trim()
    html.classList.add(`theme-${theme}`)
    const meta = document.querySelector('meta[name="theme-color"]')
    const bg = getComputedStyle(html).getPropertyValue('--color-bg-secondary').trim()
    if (meta && bg) meta.setAttribute('content', bg)
  }, [theme])

  return (
    <div className="flex h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Sidebar />
      <main className="app-main flex-1 overflow-auto" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Outlet />
      </main>
    </div>
  )
}
