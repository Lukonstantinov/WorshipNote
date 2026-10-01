import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../../store/settingsStore'
import { FONT_SIZE_MIN, FONT_SIZE_MAX } from '../lib/constants'

export function FontSizeSlider() {
  const { t } = useTranslation()
  const { fontSize, setFontSize } = useSettingsStore()

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <button
        onClick={() => setFontSize(Math.max(FONT_SIZE_MIN, fontSize - 2))}
        className="flex items-center justify-center rounded-xl font-semibold transition-all disabled:opacity-30 active:scale-90"
        style={{
          backgroundColor: 'var(--color-card-raised)',
          color: 'var(--color-text-secondary)',
          minWidth: 40,
          minHeight: 40,
          fontSize: 13,
        }}
        title={t('fontSmaller')}
        aria-label={t('fontSmaller')}
        disabled={fontSize <= FONT_SIZE_MIN}
      >
        A−
      </button>
      <button
        onClick={() => setFontSize(Math.min(FONT_SIZE_MAX, fontSize + 2))}
        className="flex items-center justify-center rounded-xl font-semibold transition-all disabled:opacity-30 active:scale-90"
        style={{
          backgroundColor: 'var(--color-card-raised)',
          color: 'var(--color-text-secondary)',
          minWidth: 40,
          minHeight: 40,
          fontSize: 17,
        }}
        title={t('fontLarger')}
        aria-label={t('fontLarger')}
        disabled={fontSize >= FONT_SIZE_MAX}
      >
        A+
      </button>
    </div>
  )
}
