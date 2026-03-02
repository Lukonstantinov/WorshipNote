import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import type { Language } from '../store/settingsStore'
import { FONT_SIZE_MIN, FONT_SIZE_MAX } from '../shared/lib/constants'

const LANGUAGES: { code: Language; label: string; sub: string }[] = [
  { code: 'ru', label: 'Русский',  sub: 'Russian' },
  { code: 'lt', label: 'Lietuvių', sub: 'Lithuanian' },
  { code: 'en', label: 'English',  sub: 'English' },
]

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { language, fontSize, scrollSpeed, setLanguage, setFontSize, setScrollSpeed } = useSettingsStore()

  const handleLanguage = (lang: Language) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    color: 'rgba(235,235,245,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 8,
    paddingLeft: 4,
  }

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100%' }}>
      <div className="px-4 py-4 border-b" style={{ borderColor: '#1c1c1e' }}>
        <h1 className="text-2xl font-bold text-white tracking-tight">{t('settings')}</h1>
      </div>

      <div className="p-4 space-y-8 pb-28 max-w-md mx-auto">

        {/* Language */}
        <section>
          <p style={sectionLabel}>{t('language')}</p>
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1c1c1e' }}>
            {LANGUAGES.map(({ code, label, sub }, idx) => (
              <button
                key={code}
                onClick={() => handleLanguage(code)}
                className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-white/5"
                style={{
                  borderTop: idx > 0 ? '1px solid #2c2c2e' : undefined,
                  minHeight: 50,
                }}
              >
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs" style={{ color: 'rgba(235,235,245,0.3)' }}>{sub}</div>
                </div>
                {language === code && (
                  <Check size={18} strokeWidth={2.5} style={{ color: '#bf5af2' }} />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Font size */}
        <section>
          <p style={sectionLabel}>{t('fontSize')}</p>
          <div
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ backgroundColor: '#1c1c1e' }}
          >
            <button
              onClick={() => setFontSize(Math.max(FONT_SIZE_MIN, fontSize - 2))}
              className="flex items-center justify-center w-12 h-12 rounded-xl font-semibold transition-all active:scale-95"
              style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.7)', fontSize: 13 }}
            >
              A−
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold text-white">{fontSize}</span>
              <span className="text-sm ml-1" style={{ color: 'rgba(235,235,245,0.3)' }}>px</span>
            </div>
            <button
              onClick={() => setFontSize(Math.min(FONT_SIZE_MAX, fontSize + 2))}
              className="flex items-center justify-center w-12 h-12 rounded-xl font-semibold transition-all active:scale-95"
              style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.7)', fontSize: 19 }}
            >
              A+
            </button>
          </div>
        </section>

        {/* Scroll speed */}
        <section>
          <p style={sectionLabel}>{t('scrollSpeed')}</p>
          <div className="grid grid-cols-4 gap-2">
            {[0.5, 1, 1.5, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => setScrollSpeed(speed)}
                className="py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                style={{
                  backgroundColor: scrollSpeed === speed ? '#bf5af2' : '#1c1c1e',
                  color: scrollSpeed === speed ? '#fff' : 'rgba(235,235,245,0.4)',
                  minHeight: 50,
                }}
              >
                {speed}×
              </button>
            ))}
          </div>
        </section>

        {/* App info */}
        <section>
          <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: '#1c1c1e' }}>
            <p className="font-semibold text-white">WorshipHub</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(235,235,245,0.3)' }}>v0.1.0 · Псалмы и аккорды</p>
          </div>
        </section>

      </div>
    </div>
  )
}
