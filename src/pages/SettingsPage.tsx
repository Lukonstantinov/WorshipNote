import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../store/settingsStore'
import type { Language } from '../store/settingsStore'
import { FONT_SIZE_MIN, FONT_SIZE_MAX } from '../shared/lib/constants'

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'ru', label: 'Русский' },
  { code: 'lt', label: 'Lietuvių' },
  { code: 'en', label: 'English' },
]

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { language, fontSize, scrollSpeed, setLanguage, setFontSize, setScrollSpeed } = useSettingsStore()

  const handleLanguage = (lang: Language) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
  }

  return (
    <div style={{ backgroundColor: '#0f0f0f', minHeight: '100%' }}>
      <div className="px-4 py-3 border-b" style={{ backgroundColor: '#1a1a2e', borderColor: '#2d2d4e' }}>
        <h1 className="text-lg font-bold text-white">{t('settings')}</h1>
      </div>

      <div className="p-4 space-y-6 pb-24 max-w-md mx-auto">

        {/* Language */}
        <section>
          <h2 className="text-sm text-gray-400 mb-3 uppercase tracking-wider">{t('language')}</h2>
          <div className="space-y-2">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => handleLanguage(code)}
                className="w-full text-left px-4 py-3 rounded-xl flex items-center justify-between"
                style={{
                  backgroundColor: language === code ? '#2d2d4e' : '#1a1a2e',
                  color: language === code ? '#a78bfa' : '#f5f5f5',
                  minHeight: 44,
                }}
              >
                {label}
                {language === code && <span>✓</span>}
              </button>
            ))}
          </div>
        </section>

        {/* Font size */}
        <section>
          <h2 className="text-sm text-gray-400 mb-3 uppercase tracking-wider">{t('fontSize')}</h2>
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: '#1a1a2e' }}>
            <button
              onClick={() => setFontSize(Math.max(FONT_SIZE_MIN, fontSize - 2))}
              className="w-12 h-12 rounded-xl font-bold text-lg"
              style={{ backgroundColor: '#2d2d4e', color: '#f5f5f5' }}
            >
              A-
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-white">{fontSize}px</span>
            </div>
            <button
              onClick={() => setFontSize(Math.min(FONT_SIZE_MAX, fontSize + 2))}
              className="w-12 h-12 rounded-xl font-bold text-lg"
              style={{ backgroundColor: '#2d2d4e', color: '#f5f5f5' }}
            >
              A+
            </button>
          </div>
        </section>

        {/* Scroll speed */}
        <section>
          <h2 className="text-sm text-gray-400 mb-3 uppercase tracking-wider">{t('scrollSpeed')}</h2>
          <div className="grid grid-cols-4 gap-2">
            {[0.5, 1, 1.5, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => setScrollSpeed(speed)}
                className="py-3 rounded-xl font-semibold text-sm"
                style={{
                  backgroundColor: scrollSpeed === speed ? '#a78bfa' : '#1a1a2e',
                  color: scrollSpeed === speed ? '#fff' : '#9ca3af',
                  minHeight: 44,
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </section>

        {/* App info */}
        <section>
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#1a1a2e' }}>
            <p className="text-white font-semibold">WorshipHub</p>
            <p className="text-xs text-gray-500 mt-1">v0.1.0 · Псалмы и аккорды</p>
          </div>
        </section>
      </div>
    </div>
  )
}
